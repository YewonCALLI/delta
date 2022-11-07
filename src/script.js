import './style.css';
import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {TextureLoader} from 'three/examples/jsm/loaders/BasisTextureLoader.js';



// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

//Update Materials
const updateAllMaterials = () =>
{
    scene.traverse((child) =>
    {
        if(child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial)
        {
			child.material.envMap = environmentMap
            child.material.envMapIntensity = 3.0
        }
    })
}


const gltfLoader = new GLTFLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()

let mixer = null
/**
 * Environment Map
 */

const environmentMap = cubeTextureLoader.load([
    '/textures/skybox/penguins (4)/battery_bk.jpg',
    '/textures/skybox/penguins (4)/battery_dn.jpg',
    '/textures/skybox/penguins (4)/battery_ft.jpg',
    '/textures/skybox/penguins (4)/battery_lf.jpg',
    '/textures/skybox/penguins (4)/battery_rt.jpg',
    '/textures/skybox/penguins (4)/battery_up.jpg'
])
scene.background = environmentMap;

/**
 * Models
 */
gltfLoader.load(
    '/models/SCG_exh-v1.glb',
    (gltf) =>
    {
        const model = gltf.scene;
        gltf.scene.scale.set(3, 3, 3)
        // const texture = new THREE.TextureLoader().load( 'textures/Untitled.png' );
        // const material = new THREE.MeshPhysicalMaterial( { map: texture } );
        // root.children[0].material = material;

        if (model.isMesh) {
            model.castShadow = true;
        }

        gltf.scene.castShadow = true;
        gltf.scene.position.y=-2.2;
        gltf.scene.traverse(function (node) {
            if (node.isMesh) {
              node.castShadow = true;
              //node.receiveShadow = true;
            }
          });

        scene.add(gltf.scene)
        updateAllMaterials()
    }
)



/**
 * Floor
 */
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100),
    new THREE.MeshStandardMaterial({
        color: '#444444',
        metalness: 0,
        roughness: 0.5
    })
)
floor.receiveShadow = true
floor.rotation.x = - Math.PI * 0.5
floor.position.y = -3.1
scene.add(floor)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight("#ffffff",0.2);
scene.add(ambientLight);

const spotLight = new THREE.SpotLight( 0xffffff ,5);
spotLight.map = environmentMap;
spotLight.position.y=4;
spotLight.penumbra = 0.3;
spotLight.castShadow = true;

spotLight.shadow.mapSize.width = 800;
spotLight.shadow.mapSize.height = 800;

spotLight.shadow.camera.near = 500;
spotLight.shadow.camera.far = 4000;
spotLight.shadow.camera.fov = 30;

scene.add( spotLight );


const pointLight = new THREE.PointLight("#ffffff", 20);
pointLight.position.set(8, 8, 4);
scene.add(pointLight);

const sphereSize = 1;
const pointLightHelper = new THREE.PointLightHelper( pointLight, sphereSize );
//scene.add( pointLightHelper );


const pointLight2 = new THREE.PointLight("#ffffff", 20);
pointLight2.position.set(-8, 8, -4);
scene.add(pointLight2);

const sphereSize2 = 1;
const pointLightHelper2 = new THREE.PointLightHelper( pointLight2, sphereSize2 );
//scene.add( pointLightHelper2 );



/**
 * Fog
 */
const color = 0x404040;  // white
const near = 10;
const far = 100;
scene.fog = new THREE.Fog(color, near, far);


/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
}

/**
 * Renderer
 */
 const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.physicallyCorrectLights = true
renderer.toneMapping=THREE.ReinhardToneMapping
renderer.toneMappingExposure=2.5
const pmremGenerator = new THREE.PMREMGenerator( renderer );
scene.environment = pmremGenerator.fromScene( new RoomEnvironment(), 0.01 ).texture;

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()
    
    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 1000)
//const camera = new THREE.OrthographicCamera(0.5 * frustumSize * aspect / -2, 0.5 * frustumSize * aspect / 2, frustumSize / 2, frustumSize / -2, 0.01, 10);
camera.position.set(0,4, 30)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.set(0, 0.75, 0)
controls.enableDamping = true
controls.enabled = false;

/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    // Model animation
    if(mixer)
    {
        mixer.update(deltaTime)
    }

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()