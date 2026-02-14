import { Component, ElementRef, input, ViewChild, OnDestroy, signal, effect, AfterViewInit, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

@Component({
  selector: 'app-pokemon-3d-viewer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative w-full h-full">
      <div #container class="w-full h-full cursor-grab active:cursor-grabbing"></div>
      
      @if (isLoading()) {
        <div class="absolute inset-0 flex items-center justify-center bg-black/20">
          <div class="text-green-400 font-mono text-[10px] animate-pulse">LOADING 3D DATA...</div>
        </div>
      }
      
      @if (error()) {
        <div class="absolute inset-0 flex items-center justify-center bg-black/40">
          <div class="text-red-500 font-mono text-[10px] text-center px-4">
            ERROR: NO 3D MODEL AVAILABLE
          </div>
        </div>
      }
    </div>
  `,
  styles: [`:host { display: block; width: 100%; height: 100%; }`]
})
export class Pokemon3dViewerComponent implements AfterViewInit, OnDestroy {
  modelUrl = input.required<string | undefined>();
  
  @ViewChild('container') container!: ElementRef<HTMLDivElement>;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private currentModel: THREE.Object3D | null = null;
  private controls!: OrbitControls;
  private animationId: number | null = null;
  private loader = new GLTFLoader();

  isLoading = signal(false);
  error = signal<string | null>(null);

  constructor() {
    effect(() => {
      const url = this.modelUrl();
      if (this.scene && url) {
        untracked(() => this.loadModel(url));
      }
    }, { allowSignalWrites: true });
  }

  ngAfterViewInit() {
    this.initThree();
    this.animate();
  }

  private initThree() {
    const width = this.container.nativeElement.clientWidth || 300;
    const height = this.container.nativeElement.clientHeight || 260;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.set(0, 0, 5);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.container.nativeElement.appendChild(this.renderer.domElement);

    this.scene.add(new THREE.AmbientLight(0xffffff, 2));
    const dirLight = new THREE.DirectionalLight(0xffffff, 3);
    dirLight.position.set(5, 5, 5);
    this.scene.add(dirLight);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.autoRotate = false;
    this.controls.enablePan = false;
  }

  private clearScene() {
    const objectsToRemove: THREE.Object3D[] = [];
    this.scene.traverse((child) => {
      if (child.name === 'pokemon-model-wrapper' || child.name === 'pokemon-model') {
        objectsToRemove.push(child);
        
        child.traverse((mesh) => {
          if (mesh instanceof THREE.Mesh) {
            mesh.geometry.dispose();
            if (Array.isArray(mesh.material)) {
              mesh.material.forEach((m: THREE.Material) => m.dispose());
            } else {
              mesh.material.dispose();
            }
          }
        });
      }
    });
    
    objectsToRemove.forEach(obj => this.scene.remove(obj));
    this.currentModel = null;
  }

  private loadModel(url: string) {
    this.clearScene();
    this.isLoading.set(true);
    this.error.set(null);

    this.loader.load(
      url,
      (gltf) => {
        const model = gltf.scene;
        model.name = 'pokemon-model';
        
        const box = new THREE.Box3().setFromObject(model);
        const center = new THREE.Vector3();
        box.getCenter(center);
        const size = new THREE.Vector3();
        box.getSize(size);
        
        model.position.x = -center.x;
        model.position.y = -center.y;
        model.position.z = -center.z;

        const wrapper = new THREE.Group();
        wrapper.name = 'pokemon-model-wrapper';
        wrapper.add(model);

        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2.5 / (maxDim || 1);
        wrapper.scale.setScalar(scale);

        this.currentModel = wrapper;
        this.scene.add(wrapper);
        this.resetCamera();
        this.isLoading.set(false);
      },
      undefined,
      (err) => {
        console.error('Error loading 3D model:', err);
        this.error.set('Failed to load 3D model');
        this.isLoading.set(false);
      }
    );
  }

  private animate() {
    this.animationId = requestAnimationFrame(() => this.animate());
    
    // Idle animation
    if (this.currentModel) {
      const time = Date.now() * 0.001;
      this.currentModel.rotation.y += 0.0009;
      this.currentModel.position.y = Math.sin(time * 2) * 0.03;
    }

    if (this.controls) {
      this.controls.update();
    }
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  moveCamera(direction: 'up' | 'down' | 'left' | 'right') {
    const step = 0.3;
    if (!this.camera || !this.controls) return;

    const right = new THREE.Vector3();
    const up = new THREE.Vector3();
    const back = new THREE.Vector3();
    this.camera.matrix.extractBasis(right, up, back);

    const delta = new THREE.Vector3();
    switch (direction) {
      case 'up': delta.addScaledVector(up, step); break;
      case 'down': delta.addScaledVector(up, -step); break;
      case 'left': delta.addScaledVector(right, -step); break;
      case 'right': delta.addScaledVector(right, step); break;
    }

    this.camera.position.add(delta);
    this.controls.target.add(delta);
    this.controls.update();
  }

  rotateCamera(deltaX: number, deltaY: number) {
    if (!this.controls || !this.camera) return;
    
    const factor = 0.005;
    
    const offset = new THREE.Vector3();
    offset.copy(this.camera.position).sub(this.controls.target);
    
    const spherical = new THREE.Spherical();
    spherical.setFromVector3(offset);
    
    spherical.theta -= deltaX * factor;
    spherical.phi -= deltaY * factor;
    
    spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));
    
    offset.setFromSpherical(spherical);
    this.camera.position.copy(this.controls.target).add(offset);
    
    this.controls.update();
  }

  resetCamera() {
    if (this.controls) {
      this.controls.target.set(0, 0, 0);
      this.camera.position.set(0, 0, 5);
      this.controls.update();
    }
  }

  ngOnDestroy() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    this.clearScene();
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.forceContextLoss();
    }
  }
}
