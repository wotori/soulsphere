let RUNNING_INDEXES = [-1];

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 50, window.innerWidth/window.innerHeight, 0.01, 1000 );
var controls = new THREE.OrbitControls ( camera );
var raycaster = new THREE.Raycaster(), intersected =null;
raycaster.params.Points.threshold = 0.015;
var renderer;
var MOUSE = new THREE.Vector2();

var clock = new THREE.Clock();

var PLANE_GROUP = new THREE.Group();
scene.add(PLANE_GROUP);

var windowX = window.innerWidth / 2;
var windowY = window.innerHeight / 2;

camera.position.x = 7
camera.position.y = 7
camera.position.z = 7

//GLOBAL EVENTS

onMouseMove = (event) => {
	event.preventDefault();
	raycaster.setFromCamera( MOUSE, camera );
	MOUSE.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	MOUSE.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

var timesClicked = 0;
onMouseClick = (event) => {
	timesClicked ++;
	const intersects = raycaster.intersectObjects(PLANE_GROUP.children,true);
	log(intersects[0].object.name);
	curObjs = PLANE_GROUP.children;
	camX = curObjs[curObjs.length - 1].matrix.elements[12]
	camY = curObjs[curObjs.length - 1].matrix.elements[13]
	camZ = curObjs[curObjs.length - 1].matrix.elements[14]
	if (timesClicked % 2 != 0){
		cameraUpdater()
	} else {
		// camera.position.set (0, 0, 12)
		cameraUpdater()
	}
	intersects[0].object.dissolving = false;
}

//GLOBAL FUNCTIONS

log = (s) => console.log(s);  

ConvertToWorld = (index) => pointsClouds.geometry.vertices[index].clone().applyMatrix4(pointsClouds.matrixWorld);

var renderer = new THREE.WebGLRenderer({ antialias : true });
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

//light
var lights = [];
lights[ 0 ] = new THREE.PointLight( 0xffffff, 1, 0 );
lights[ 0 ].position.set( 0, 200, 0 );
scene.add( lights[ 0 ] );


//blackGeo
var geometry = new THREE.IcosahedronGeometry( 1.97, 3 );
var meshMaterial = new THREE.MeshBasicMaterial( { color: 'black' } );
var mesh = new THREE.Mesh( geometry, meshMaterial );

//wireFrame
var lineMat = new THREE.LineBasicMaterial({ color: 'white' })
var geometryWire = new THREE.IcosahedronBufferGeometry( 2, 3 );
var wireframe = new THREE.WireframeGeometry( geometryWire );
var line = new THREE.LineSegments( wireframe, lineMat );
line.material.opacity = 1;
line.material.transparent = true;

//points setup
var pointGeo = new THREE.IcosahedronGeometry( 3.5, 4 )
var pointMat = new THREE.PointsMaterial({ color : 'white', size : 0.04 });

pointGeo.vertices.forEach(function(vertex) { 
vertex.x += (Math.random() - 0.5);
vertex.y += (Math.random() - 0.5);
vertex.z += (Math.random() - 0.5);
})

var pointsClouds = new THREE.Points( pointGeo, pointMat );
var objGroup = new THREE.Group()
objGroup.add (line,mesh,pointsClouds)
scene.add( objGroup );

camera.position.z = 5;

document.addEventListener('mousemove', onMouseMove, false );
document.addEventListener('mousedown', onMouseClick, false);

//RENDER

render = (time) => {

let intersects = raycaster.intersectObjects( [pointsClouds] );

intersects.length > 0 
?
	RUNNING_INDEXES.indexOf(intersects[0].index) == -1 
			? (
					RUNNING_INDEXES.push(intersects[0].index),
					PLANE_GROUP.add(new PlaneAvatar(PLANE_GROUP,intersects[0].index))
				)
			: void null 
: void null; 
				
PLANE_GROUP.children.map((i,j) =>
		i.scale.z <= 0.1 ? i.removeFromGroup(i.parent) : (i.run(ConvertToWorld(i.name)),i.dissolve())
)

camera.lookAt( scene.position );

//FIND INTERSECTION

camera.updateMatrixWorld();
renderer.render( scene, camera );

};

pointsClouds.geometry.verticesNeedUpdate = true;
pointsClouds.matrixAutoUpdate = true;

animate = () => {

window.requestAnimationFrame(animate);
var time = clock.getElapsedTime();
render(time);

objGroup.rotation.x += 0.001;
objGroup.rotation.y += 0.001;

if (timesClicked % 2 != 0) {
	cameraUpdater()
}

}

var cameraUpdater = function() {
camX = curObjs[curObjs.length - 1].matrix.elements[12]
camY = curObjs[curObjs.length - 1].matrix.elements[13]
camZ = curObjs[curObjs.length - 1].matrix.elements[14]

curX = camera.position.x
curY = camera.position.y
curZ = camera.position.z

if (timesClicked % 2 != 0){
	console.log('tracking dot')
	camera.position.set (camX, camY, camZ)
	camera.lookAt(camX, camY, camZ)
} else {
	console.log('resetCamera')
	camera.position.set (0, 0, 10)
	camera.setFocalLength(28)
}

}

window.requestAnimationFrame(animate);

class PlaneAvatar extends THREE.Mesh {

constructor(Group,AnchorPointIndex) {

	super(new THREE.SphereGeometry( 0.4, 20, 20 ),new THREE.MeshBasicMaterial({color: 0xffff00, side: THREE.DoubleSide}));
	this.name = AnchorPointIndex;
	this.dissolving = true;
	Group.add(this);

};

removeFromGroup = (Group) => Group.remove(this);

run = (vector) => this.position.set(vector.x,vector.y,vector.z);

dissolve = () => {
if (this.dissolving) {
		for(var XYZ in this.scale) {

			let P = this.scale[XYZ] - Math.random()/100;
			this.scale[XYZ] = (P > 0) ? P : 0.0001;

}} 

}

enlarge = () => this.scale = new THREE.Vector3(20,20,10) 

}