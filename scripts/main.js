import operations from "/scripts/operations.js";
import  {inputManger, input, inputManagerUpdate} from "/scripts/inputManager.js";
import  {controlsFunctions as controls} from "/scripts/controls.js";
var tjs = THREE;

async function init(){


const scene = new THREE.Scene();


const renderer = new THREE.WebGLRenderer({alpha: true});
renderer.setSize( window.innerWidth, window.innerHeight ); 
document.body.appendChild( renderer.domElement );

var clock = new tjs.Clock();

const light = new THREE.AmbientLight( 0xffffff );
light.intensity = 10 
light.position.y = 10;
scene.add( light );

var plane = new THREE.Mesh( new THREE.PlaneGeometry( 2000, 2000 ), new THREE.MeshPhongMaterial( { color: 0xfff99, depthWrite: false } ) );
plane.rotation.x = - Math.PI / 2; 
plane.position.y=-1
scene.add( plane ); 

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshPhongMaterial( { color: 0x00ff00, opacity: .2, transparent: true } );
const cube = new THREE.Mesh( geometry, material );
const cube2 = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { color: 0xf0ff00 } ) );

const geometryCollider = new THREE.BoxGeometry();
const materialCollider = new THREE.MeshPhongMaterial( { color: 0x00ffff, opacity: .2, transparent: true } );
const collider = new THREE.Mesh( geometryCollider, materialCollider );
collider.scale.y = 2.5;

scene.add(cube, cube2, collider);
cube.position.y = 1
cube.scale.y = 2.5;
cube2.position.x = 1.5
cube2.position.z = -1.5



var cameraMoveSpeed = 1;
var cameraLerpAmount = .07;

var step = 0.01;


var lerpMoveSpeed = 1;

var movec = {x: 0, y: 0}
var crmax = {x: -.5, y: .9};

var cmt = cube.position;
var cmt2 = new THREE.Vector3().copy(cube.position);
var camera = new operations.orbitalCamera(cmt2, new tjs.Vector3(0,2,5), false, scene);


var move = {x: 0, y: 0}
var moveSpeed = .1;
var moveLerp = .05; 
 

var cameraDistance = 0;
var cameraDistanceFull = 5;
 





var player = new operations.animationModel(scene)
var modelSise = .015;
await player.addAnimation("main", "models/main/main.fbx", modelSise);
await player.addAnimation("iddle", "models/main/main.fbx");
await player.addAnimation("walk", "models/main/walk.fbx");
await player.addAnimation("walkBackward", "models/main/walkBackward.fbx");
await player.addAnimation("walkRight", "models/main/walkRight.fbx");
await player.addAnimation("walkLeft", "models/main/walkLeft.fbx");
await player.addAnimation("tet1", "models/main/tet1.fbx");
await player.addAnimation("tet2", "models/main/tet2.fbx");

player.animationPlane = new operations.animationPlane(player);
player.animationPlane.addAnimation(player.getAnimationByName("iddle"), {x: 0, y: 0})
player.animationPlane.addAnimation(player.getAnimationByName("walk"), {x: 0, y: 1})
player.animationPlane.addAnimation(player.getAnimationByName("walkBackward"), {x: 0, y: -1})
player.animationPlane.addAnimation(player.getAnimationByName("walkRight"), {x: 1, y: 0})
player.animationPlane.addAnimation(player.getAnimationByName("walkLeft"), {x: -1, y: 0}) 
//player.animationPlane.addAnimation(player.getAnimationByName("tet1"), {x: -1, y: -1}) 


console.clear()

window.p = player






function animate() {
	requestAnimationFrame( animate );
    inputManagerUpdate(); 


    player.mixer.update(clock.getDelta());

    movec.x = inputManger.camera.horizontal;  //operations.lerp(movec.x, inputManger.camera.horizontal, cameraLerpAmount);
    movec.y = inputManger.camera.vertical;    //operations.lerp(movec.y, inputManger.camera.vertical, cameraLerpAmount);
    var endMovexc = movec.x * cameraMoveSpeed / 700;
    var endMoveyc = movec.y * cameraMoveSpeed / 500; 
 

    
     

    camera.y.rotation.x =  camera.y.rotation.x + endMovexc < crmax.x? crmax.x:
                           camera.y.rotation.x + endMovexc > crmax.y? crmax.y:
                           camera.y.rotation.x += endMovexc;

    if(cmt == cube.position){   
        camera.x.rotation.y += endMoveyc 
    } else {   
        var fixPos = new THREE.Vector3().copy(cmt2);
        fixPos.y = cube.position.y; 
        camera.x.lookAt(cmt2)
    }

      
    move.x = operations.lerp(move.x, inputManger.vertical, moveLerp);
    move.y = operations.lerp(move.y, inputManger.horizontal, moveLerp);
    var movex = move.x * moveSpeed;
    var movey = move.y * moveSpeed;
    
    player.animationPlane.setVertical(move.x)
    player.animationPlane.setHorizontal(move.y)


    var toVertical = cube.forward(movex);
    toVertical.y = 0;
    var toHorizontal = cube.right(movey); 
 
    camera.lookToTarget(new tjs.Vector3(0,.3))
    var cameraPosAux = cube.position.clone().add(camera.forward())
        cameraPosAux.y = cube.position.y;

    cube.lookAt(cameraPosAux);

    var lmt = 0.1;   /* 
    if(!(move.y > -lmt && move.y < lmt) || !(move.x > -lmt && move.x < lmt)){
        var cameraPosAux = cube.position.clone().add(camera.forward())
            cameraPosAux.y = cube.position.y;

        cube.lookAt(cameraPosAux);
        camera.lookToTarget(cube.right(.2).add(cube.forward(1)).add(new tjs.Vector3(0,.3)));
    } else {
        camera.lookToTarget(new tjs.Vector3(0,.3))
    }
     */
    camera.x.position.copy(cube.position.clone())



    cube.position.add(toHorizontal).add(toVertical)

    var cdist = {min: 2, max: 15}
    cameraDistance = operations.lerp(cameraDistance, controls.getMouseWheel(), .2)
    cameraDistanceFull = cameraDistanceFull + cameraDistance > cdist.max? cdist.max:
                         cameraDistanceFull + cameraDistance < cdist.min? cdist.min:
                         cameraDistanceFull += cameraDistance
    camera.setDistance(new tjs.Vector3(0,3,cameraDistanceFull))

    
    //cube2.position.copy(cube.position.clone().add(cube.forward(2)))
    //console.log(cube.position.z);

    var modelPos = cube.position.clone()
    modelPos.y = modelPos.y - (cube.scale.y/2)
    player.model.position.copy(modelPos)

    var modelLookAt = cube.position.clone().add(cube.forward()) 
    modelLookAt.y = player.model.position.y
    player.model.lookAt(modelLookAt)

    collider.position.copy(cube.position) 
    var colliderPos = cube.position.clone().add(cube.forward()) 
    colliderPos.y = collider.position.y
    collider.lookAt(colliderPos)


    cmt2.lerp(cmt, .5/2)
    if(controls.getMouseUp(1)){
        if(cmt == cube.position){
            cmt = cube2.position;  
        } else {
            cmt = cube.position 
        }
    } 
    if(controls.getKey("ArrowLeft")){
        lerpMoveSpeed -= step
        console.log(lerpMoveSpeed); 
    } else if(controls.getKey("ArrowRight")){
        lerpMoveSpeed += step
        console.log(lerpMoveSpeed);
    }
 

	renderer.render( scene, camera.camera );
}
animate();


}
init();