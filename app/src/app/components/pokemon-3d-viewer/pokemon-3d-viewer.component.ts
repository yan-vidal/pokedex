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
  private currentModel: THREE.Group | null = null;
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
    this.scene.background = null; 

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
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 4;
    this.controls.enablePan = false;
  }

  private clearScene() {
    if (this.currentModel) {
      this.scene.remove(this.currentModel);
      this.currentModel.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach(m => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
      this.currentModel = null;
    }

    const objectsToRemove: THREE.Object3D[] = [];
    this.scene.traverse((child) => {
      if (child.name === 'pokemon-model') {
        objectsToRemove.push(child);
      }
    });
    
    objectsToRemove.forEach(obj => this.scene.remove(obj));
  }

  private loadModel(url: string) {
    this.clearScene();
    this.isLoading.set(true);
    this.error.set(null);

    this.loader.load(
      url,
      (gltf) => {
        this.currentModel = gltf.scene;
        this.currentModel.name = 'pokemon-model';
        
        const box = new THREE.Box3().setFromObject(this.currentModel);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        this.currentModel.position.x -= center.x;
        this.currentModel.position.y -= center.y;
        this.currentModel.position.z -= center.z;

        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 3.5 / (maxDim || 1);
        this.currentModel.scale.setScalar(scale);

        this.scene.add(this.currentModel);
        
        if (this.controls) {
          this.controls.reset();
          this.camera.position.set(0, 0, 5);
        }

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
    if (this.controls) this.controls.update();
    if (this.renderer) this.renderer.render(this.scene, this.camera);
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
