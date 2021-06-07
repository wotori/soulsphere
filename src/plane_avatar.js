import * as THREE from 'three'
import * as TWEEN from '@tweenjs/tween.js';
import { camera } from './app'

export class PlaneAvatar extends THREE.Mesh {

    constructor(Group, AnchorPointIndex, oINFO) {
        super(
            new THREE.CircleGeometry(0.35, 64, 64),
            new THREE.MeshBasicMaterial({
                map: oINFO.fetchedPic
            })
        );
        this.name = AnchorPointIndex;
        this.info = {
            name: oINFO.name,
            location: oINFO.location,
            audio: oINFO.audio ?
                oINFO.audio :
                "https://cdn.glitch.com/ff820234-7fc5-4317-a00a-ad183b72978d%2Fmoonlight.mp3?1512000557559"
        }; 

        this.dissolving = true; //Dissolving by default

        this.resizingChain = true;
        this.dissolveTween = new TWEEN.Tween(this.scale)
            .to({
                x: 0.001,
                y: 0.001,
                z: 0.001
            },
                8000
            )
            .easing(TWEEN.Easing.Quadratic.Out);
        this.enlargeTween = new TWEEN.Tween(this.scale)
            .to({
                x: 1,
                y: 1,
                z: 1
            },
                325
            )
            .easing(TWEEN.Easing.Quadratic.Out)
            .onStart(() => (this.material.opacity = 0.08))
            .onUpdate(() => {
                if (this.scale.z > 0.999 && this.resizingChain) {
                    //About to complete
                    this.dissolving = true; //Now shall dissolve again by default
                }
            });
        this.camTweenFocusMe; //init variable

        Group.add(this);
    }

    removeFromGroup(Group) {
        log("REMOVE <E");
        const index = RUNNING_INDEXES.indexOf(this.name);
        RUNNING_INDEXES.splice(index);
        Group.remove(this);
    }

    run(vector) {
        return this.position.set(vector.x, vector.y, vector.z + 0.01);
    }

    camFocusMe(t) {
        return (this.camTweenFocusMe = new TWEEN.Tween(camera.position)
            .to({
                x: this.position.x + 0.4,
                y: this.position.y,
                z: this.position.z + 6
            },
                850
            )
            .easing(TWEEN.Easing.Quadratic.InOut));
    }

    updateSize() {
        return this.dissolving ?
            (this.enlargeTween.stop(), this.dissolveTween.start()) :
            (this.dissolveTween.stop(), this.enlargeTween.start());
    }
} //rotation on mouse click and drag