import {initializeMouseCapture} from "/scripts/controls.js"; 
import { FBXLoader } from '/examples/jsm/loaders/FBXLoader.js'; 
var operations = {
    lerp: (from = 0, to = from, amount = 1) => {
        amount = (amount>1)? 1: ((amount<0)? 0: amount);
        if(from < to){
            from = from + ((to - from) * amount)
        } else {
            from = from - ((from - to) * amount)
        }

        return from
    },
    orbitalCamera: class{
        constructor(target, distance = new THREE.Vector3(0,0,10), visibleAxis = false, scene, dom = document.body){ 
            
            if(!scene){
                throw "orbitalCamera: scene must be a real Scene"
            }

            this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );


            this.x = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial({color: 0xffff00}));
            this.x.visible = visibleAxis; 
    
            this.y = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial({color: 0x0fffff}));
            this.y.visible2 = visibleAxis;   
            this.y.rotation.y = Math.PI;


            distance = distance?.isVector3? distance:
                       typeof distance != "number"? new THREE.Vector3(0,0,0):
                       new THREE.Vector3(0, 0, distance)
            this.camera.position.copy(distance);

            this.target = target;

            this.x.position.copy(this.target?.isObject3D? this.target.position: this.target);
    
            this.y.add(this.camera);
            this.x.add(this.y);
            scene.add(this.x);  
    
            this.objects = {
                cameraPlaceHolderX: this.x,
                cameraPlaceHolderY: this.y,
                camera: this.camera,
                target: this.target
            }
    
            initializeMouseCapture(dom);
        }
        lookToTarget(plus = new THREE.Vector3()){
            this.camera.lookAt((this.target?.isObject3D? this.target.position: this.target).add(plus))
        }
        setPosition(vector){
            this.x.position.copy(vector);
        }
        forward(distance = 1 ){
            var pos = this.camera.getWorldDirection(new THREE.Vector3()) 
            return pos.multiplyScalar(distance);
        }
        right(distance = 1){
            var auxMesh = new THREE.Mesh();
            auxMesh.visible = false;  
            
            this.camera.getWorldQuaternion(auxMesh.rotation);
        
            auxMesh.rotateY(THREE.Math.degToRad(90));
        
            var pos = auxMesh.forward(distance) 
            
            return pos;
        }
        changeTarget(newTarget){
            this.target = newTarget;
        }
        setDistance(distance){ 
            this.camera.position.copy(distance?.isVector3? distance:
                                      typeof distance != "number"? new THREE.Vector3(0,0,10):
                                      new THREE.Vector3(0, 0, distance))  
        }
    },
    animation: class{
        constructor(name, animation, mixer){
            this.name = name;
            this.animation = animation;
            this.mixer = mixer;
        }
        setWeight(w = 0){ 
            var action = this.mixer.clipAction(this.animation); 
            action.setEffectiveTimeScale(1);
            action.setEffectiveWeight(w);
        }
    },
    animationModel: class{
        constructor(scene){
            this.scene = scene;
            this.animations = [];
        }
        async addAnimation(name, path, scalar = 1){
            if(!name){ throw "Animatios should aways have a name" }
            const loader = new FBXLoader();
            
            return loader.loadAsync(path).then((e)=>{
                if(this.animations.find(anim => anim.name == name)){
                    throw "Animations cant have the same name."
                }
                if(!this.animations.length){
                    this.mixer = new THREE.AnimationMixer(e); 
                    this.model = e;
                    this.scene.add(e);
                }
                e.scale.setScalar(typeof scalar == "number"? scalar: 1);  
                this.animations.push(new operations.animation(name, e.animations[0], this.mixer));

                this.animations.forEach(e => {
                    var action = e.mixer.clipAction(e.animation);
                    action.play();  
                    action.setEffectiveTimeScale(1);
                    action.setEffectiveWeight(0);
                })
            }).catch((err)=>{throw err})
        }

        getAnimationByName(name){
            return this.animations.find(e => e.name == name)
        }
    },
    animationPlane: class{
        constructor(model){
            this.model = model;
            this.animations = [];
            this.x = 0;
            this.y = 0;
            this.bigger = {x: 0, y: 0}
            this.lesser = {x: 0, y: 0}
        }
        addAnimation(animation, point){
            var lx = typeof point.x == "number"? point.x: 0;
            var ly = typeof point.y == "number"? point.y: 0;
            this.bigger.x = lx > this.bigger.x? lx: this.bigger.x;
            this.bigger.y = ly > this.bigger.y? ly: this.bigger.y;
            this.lesser.x = lx < this.lesser.x? lx: this.lesser.x;
            this.lesser.y = ly < this.lesser.y? ly: this.lesser.y; 
    
            this.animations.push({animation: animation, x: lx, y: ly})
        }
        setVertical(n){
            this.y = n;
            this.updateAnimation();
        }
        setHorizontal(n){
            this.x = n;
            this.updateAnimation();
        }
        updateAnimation(){
            this.animations.forEach(e => {
                var yto0 = this.bigger.y + Math.abs(this.lesser.y);
                var distY = (e.y == 0? (this.y > 0? this.bigger.y:
                                        this.y < 0? Math.abs(this.lesser.y):
                                        yto0/2) - Math.abs(this.y):
                            (e.y < 0? Math.abs(this.y): this.y))
          
                var xto0 = this.bigger.x + Math.abs(this.lesser.x);
                var distX = (e.x == 0? (this.x > 0? this.bigger.x:
                                        this.x < 0? Math.abs(this.lesser.x):
                                        xto0/2) - Math.abs(this.x):
                            (e.x < 0? Math.abs(this.x): this.x))
                              
    
                var multiy = (e.y > 0 && this.y > 0? 1:
                            e.y < 0 && this.y < 0? 1: 
                            e.y == 0 && e.x == 0? (yto0/2) - Math.abs(this.y): 0);
    
                var multix = (e.x > 0 && this.x > 0? 1:
                            e.x < 0 && this.x < 0? 1: 
                            e.x == 0 && e.y == 0? (xto0/2) - Math.abs(this.x): 0);
    
                if(e.y != 0 || e.x != 0) { 
                    var auxval = (distY * multiy) + (distX * multix);
                    //console.log(auxval);
                    e.animation.setWeight(auxval);
                }

                /* 
                criar xbef e xaft
                this.animation.find animation.x > e.x = proxima anima????o (xaft)
                this.animation.find animation.x < e.x = anima????o anteirior (xbef)
                comparar com this x e pegar a distancia do ponto this x para xbet e xaft

                o resultado dessa conta sera um numero de 0 a 1 pra ser inserido em setWeight()
                */


                /* if(e.y != 0) {
                    e.animation.setWeight(distY * multiy);
                }
                if(e.x != 0) {
                    e.animation.setWeight(distX * multix);
                } */
                if(e.y == 0 && e.x == 0){
                    e.animation.setWeight((distY * multiy) + (distX * multix) - Math.abs(this.x) - Math.abs(this.y))
                }
    
            }); 
        }
    }
}

var auxName = "forward"
THREE.Mesh.prototype[auxName] = THREE.Camera.prototype[auxName] = function(distance = 1){
    var pos = this.getWorldDirection(new THREE.Vector3()) 
    return pos.multiplyScalar(distance);
}
auxName = "backward"
THREE.Mesh.prototype[auxName] = THREE.Camera.prototype[auxName] = function(distance = 1){
    var pos = this.getWorldDirection(new THREE.Vector3()) 
    return pos.multiplyScalar(-distance);
}
auxName = "right"
THREE.Mesh.prototype[auxName] = THREE.Camera.prototype[auxName] = function(distance = 1){
    var auxMesh = new THREE.Mesh();
    auxMesh.visible = false;  
    
    this.getWorldQuaternion(auxMesh.rotation);

    auxMesh.rotateY(THREE.Math.degToRad(90));

    var pos = auxMesh.forward(-distance) 
    
    return pos;
}
auxName = "left"
THREE.Mesh.prototype[auxName] = THREE.Camera.prototype[auxName] = function(distance = 1){
    var auxMesh = new THREE.Mesh();
    auxMesh.visible = false;  
    
    this.getWorldQuaternion(auxMesh.rotation);

    auxMesh.rotateY(THREE.Math.degToRad(90));

    var pos = auxMesh.forward(distance) 
    
    return pos;
}

export default operations;