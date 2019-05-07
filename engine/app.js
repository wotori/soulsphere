let USERS;


// $.getJSON("users.json", function(json) {
//     console.log(json); // this will show the info it in firebug console
// });

let xmlhttp = new XMLHttpRequest();

xmlhttp.onreadystatechange = function() {
if (this.readyState == 4 && this.status == 200) {
	USERS = JSON.parse(this.responseText);
	// console.log(USERS)
    }
};

xmlhttp.open("GET", '/userdata/users.json', true);
xmlhttp.send();


//Audio

 var ctx = new AudioContext();
 var audio = document.getElementById('Audio');
 var audioSrc = ctx.createMediaElementSource(audio);
 audioSrc.connect(ctx.destination);
 var analyser = ctx.createAnalyser();

 audioSrc.connect(analyser);

 audio.play();


let RUNNING_INDEXES = [];

let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera( 50, window.innerWidth/window.innerHeight, 0.01, 1000 );

let raycaster = new THREE.Raycaster();
raycaster.params.Points.threshold = 0.07;

let raycasterClick = new THREE.Raycaster();
raycasterClick.params.Points.threshold = 0.0001;


Descript = document.getElementById('info')
DescriptName = document.getElementById('name');
DescriptLocation = document.getElementById('location');

Descript.style.opacity = 1;

let MOUSE = new THREE.Vector2();

let clock = new THREE.Clock();

let picindex = 0;

let PLANE_GROUP = new THREE.Group();
scene.add(PLANE_GROUP);

let windowX = window.innerWidth / 2;
let windowY = window.innerHeight / 2;

camera.position.set(0,0,9);

//GLOBAL EVENTS
function onWindowResize(){
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}

onMouseMove = (event) => {
	event.preventDefault();
	MOUSE.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	MOUSE.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
	raycaster.setFromCamera( MOUSE, camera );
}

let Selected,preSelected;
let objToTrackName = -1;
let flagToMove = true;

onMouseClick = (event) => {

	raycasterClick.setFromCamera( MOUSE, camera );
	let intersectsClick = raycasterClick.intersectObjects(PLANE_GROUP.children,true);
	if (objToTrackName == -1 && intersectsClick[0] ) { //click on avatar move In
		
		Selected = intersectsClick[0].object;

		if (Selected.info) {
			DescriptName.innerHTML = Selected.info.name;
			DescriptLocation.innerHTML = Selected.info.location; 
		} else {
			DescriptName.innerHTML = "id"+Selected.name;
			DescriptLocation.innerHTML = "Neverland";
		}

		Descript.style.opacity = 1;


		camTweenOut && camTweenOut.stop();
		preSelected && (preSelected.dissolving = true);
		preSelected = Selected;
		Selected.dissolving = false
		objToTrackName  = Selected.name; //camFocusme

		Global.map((i,j)=>{i.to1.stop(),i.to0.start()});
		CosmoDust.to1();
		flagToMove = false;
		intersectsClick = null;

	} else {  // Move out

		flagToMove = true;
		Selected && (Selected.dissolving = true);
		objToTrackName = -1;
	 
		//Tweens activate
		camTweenOut.start();
		Global.map((i,j)=>{i.to0.stop(),i.to1.start()});
		CosmoDust.to0();

		Descript.style.opacity = 0;

	}
}

//GLOBAL FUNCTIONS
log = (s) => console.log(s);  

ConvertToWorld = (index) => {
	
	return pointsClouds.geometry.vertices[index].clone().applyMatrix4(pointsClouds.matrixWorld)
}

createCanvasMaterial = (color, size) => {
	var matCanvas = document.createElement('canvas');
	matCanvas.width = matCanvas.height = size;
	var matContext = matCanvas.getContext('2d');
	// create exture object from canvas.
	var texture = new THREE.Texture(matCanvas);

	// Draw a circle
	var center = size / 2;
	matContext.beginPath();
	matContext.arc(center, center, size/2, 0, 2 * Math.PI, false);
	matContext.closePath();
	matContext.fillStyle = color;
	matContext.fill();
	// need to set needsUpdate
	texture.needsUpdate = true;
	// return a texture made from the canvas
	return texture;
}

let camTweenOut = new TWEEN.Tween(camera.position) 
						.to({ x:0, y:0, z:9 }, 1600) 
						.easing(TWEEN.Easing.Quadratic.InOut);

let camTweenFocusMe;

let renderer = new THREE.WebGLRenderer({ antialias : true });
renderer.setClearColor (0x13131B, 1)
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

//Dust
parameters = [
	[ [1, 1, 1], 0.9],
	[ [0.95, 1, 0.5], 1],
	[ [0.90, 1, 0.5], 1.4],
	[ [0.85, 1, 0.5], 1.1],
	[ [1, 1, 1], 0.8]
];
parameterCount = parameters.length;
DustGeometry = new THREE.Geometry(); /*	NO ONE SAID ANYTHING ABOUT MATH! UGH!	*/
bg_particles_count = 1000; /* Leagues under the sea */

//Particles
for (i = 0; i < bg_particles_count; i++) {
	var vertex = new THREE.Vector3();
	vertex.x = Math.random() * 2000 - 1000;
	vertex.y = Math.random() * 2000 - 1000;
	vertex.z = Math.random() * 2000 - 1000;

	DustGeometry.vertices.push(vertex);
}

let CosmoDust = new THREE.Group()
let DustMaterials = []

for (i = 0; i < parameterCount; i++) {

	color = parameters[i][0];
	size = parameters[i][1];

	DustMaterials[i] = new THREE.PointsMaterial({
		size: size,
		map: createCanvasMaterial('white', 256),
		transparent: true,
		depthWrite: true,
		opacity:0
	});

	particles = new THREE.Points(DustGeometry, DustMaterials[i]);

	particles.rotation.x = Math.random() * 6;
	particles.rotation.y = Math.random() * 6;
	particles.rotation.z = Math.random() * 6;

	CosmoDust.add(particles);
}

scene.add(CosmoDust);

//globus
let SphereGeometry = new THREE.IcosahedronGeometry( 1.97, 3 );
let SphereMaterial = new THREE.MeshBasicMaterial( { color: 0x13131B,transparent: true } );
let SphereMesh = new THREE.Mesh( SphereGeometry, SphereMaterial );

//wireFrame
let lineMat = new THREE.LineBasicMaterial({ color: 0x3C4051 })
let geometryWire = new THREE.IcosahedronBufferGeometry( 2, 2 );
let wireframe = new THREE.WireframeGeometry( geometryWire );
let line = new THREE.LineSegments( wireframe, lineMat );
line.material.opacity = 1;
line.material.transparent = true;

//pointClouds
let pointGeo = new THREE.SphereGeometry( 3.5, 17, 17 )
let pointMat =  new THREE.PointsMaterial({
	size: 0.04,
	map: createCanvasMaterial('white', 256),
	transparent: true,
	depthWrite: false
  });

pointGeo.vertices.forEach(function(vertex) { 
	vertex.color =
	vertex.x += (Math.random() - 0.5);
	vertex.y += (Math.random() - 0.5);
	vertex.z += (Math.random() - 0.5);
})

let pointsClouds = new THREE.Points( pointGeo, pointMat );

let Globus = new THREE.Group()
Globus.add (line,SphereMesh)

let GlobusAndPoints = new THREE.Group();
GlobusAndPoints.add(Globus,pointsClouds)

// scene.add(Globus);
scene.add(GlobusAndPoints);

document.addEventListener('mousemove', onMouseMove, false );
document.addEventListener('mouseup', onMouseClick, false);

//OPACITY TWEENS
CosmoDust.opacity1 = [];
CosmoDust.opacity0 = [];

CosmoDust.children.map((i)=>{

	CosmoDust.opacity0.push(new TWEEN.Tween(i.material) 
														.to({opacity:0}, 2000) 
														.easing(TWEEN.Easing.Exponential.Out))

	CosmoDust.opacity1.push(new TWEEN.Tween(i.material) 
														.to({opacity:1}, 2000) 
														.easing(TWEEN.Easing.Exponential.Out))
});


CosmoDust.to0 = () => {
	CosmoDust.opacity1.map((i)=>i.end())
	CosmoDust.opacity0.map((i)=>i.start())
}

CosmoDust.to1 = () => {
	CosmoDust.opacity0.map((i)=>i.end())
	CosmoDust.opacity1.map((i)=>i.start())
}




let Global = [Globus.children[0],Globus.children[1],pointsClouds];




Global.map((i,j)=>{
  
  i.to0 =  new TWEEN.Tween(i.material) 
				.to({opacity:0}, 1500) 
				.easing(TWEEN.Easing.Exponential.Out)
				.onComplete(()=>i.visible=false)
							
  i.to1 =  new TWEEN.Tween(i.material) 
				.to({opacity:1}, 2000) 
				.easing(TWEEN.Easing.Quadratic.InOut)
				.onStart(()=>i.visible=true)
})

window.addEventListener ( 'resize', onWindowResize, false )


getUserDescript =(index)=> USERS.find((e)=> e.pic == index);

//RENDER
render = (time) => {
	TWEEN.update();
	if (objToTrackName == -1){ //FIND intersection with pC
		let intersects = raycaster.intersectObjects( [pointsClouds] );

		intersects.length > 0
		?
			RUNNING_INDEXES.indexOf(intersects[0].index) == -1
					? (		
							picindex < 61 ? picindex++ : picindex = 0, 
							// log(RUNNING_INDEXES),
							RUNNING_INDEXES.push(intersects[0].index),
							PLANE_GROUP.add(new PlaneAvatar(PLANE_GROUP,intersects[0].index,picindex, getUserDescript(picindex))
							)
						)
					: void null
		: void null; 
	};

	PLANE_GROUP.children.map((i,j) =>
		
											{i.run(ConvertToWorld(i.name)); //runing by the point
											 objToTrackName == i.name ? (i.camFocusMe().start(),objToTrackName=-1):void null; //focus
											 i.dissolve()} //dissolve handler
	)

	//FIND INTERSECTION
	camera.updateMatrixWorld();
	renderer.render( scene, camera );

};

pointsClouds.geometry.verticesNeedUpdate = true;
pointsClouds.matrixAutoUpdate = true;



class PlaneAvatar extends THREE.Mesh {

	constructor( Group, AnchorPointIndex, picindex , descript) {

		const texture = new THREE.TextureLoader().load( "/userdata/pic/Frame-"+picindex+".png" );
		super(new THREE.CircleGeometry( 0.35, 64 ,64 ), new THREE.MeshBasicMaterial({ map: texture }));
		
		this.name = AnchorPointIndex; 
		this.info = descript;
		this.dissolving = true; //Dissolving by default
		// this.position.set( camera.position ); // set initial position

		this.dissolveTween = new TWEEN.Tween( this.scale ) 
							.to({ x:0.0001, y:0.0001, z:0.0001 }, 7000) 
							.easing( TWEEN.Easing.Quadratic.Out )
							.onComplete(()=>this.removeFromGroup(PLANE_GROUP))

		this.enlargeTween = new TWEEN.Tween( this.scale ) 
							.to({ x:1.5, y:1.5, z:1.5 }, 650) 
							.easing( TWEEN.Easing.Quadratic.Out )
							.onComplete(()=>log(this.scale))

		this.camTweenFocusMe;

		Group.add(this);
};

removeFromGroup = (Group) => {
		log('REMOVE <E');
		const index = RUNNING_INDEXES.indexOf(this.name)
		RUNNING_INDEXES.splice(index);
		Group.remove(this);
}


run = (vector) => this.position.set(vector.x,vector.y,vector.z);

camFocusMe = (t) => this.camTweenFocusMe = new TWEEN.Tween(camera.position) 
											.to({ x:this.position.x+1.2, y:this.position.y, z:this.position.z+5 }, 1000) 
											.easing(TWEEN.Easing.Quadratic.InOut)

dissolve = () => this.dissolving ? (this.enlargeTween.stop(),this.dissolveTween.start()) : (this.dissolveTween.stop(),this.enlargeTween.start());

}

//rotation on mouse click and drag
function groupRotation(){
	var mouseDown = false,
	mouseX = 0,
	mouseY = 0;

	function onMouseMove(evt) {
		if (!mouseDown) {
			return;
		}

		evt.preventDefault();

		var deltaX = evt.clientX - mouseX,
			deltaY = evt.clientY - mouseY;
		mouseX = evt.clientX;
		mouseY = evt.clientY;
		rotateScene(deltaX/7, deltaY/7);
	}

	function onMouseDown(evt) {
		evt.preventDefault();

		mouseDown = true;
		mouseX = evt.clientX;
		mouseY = evt.clientY;
	}

	function onMouseUp(evt) {
		evt.preventDefault();

		mouseDown = false;
	}
	var ee = document.body.appendChild(renderer.domElement);
	ee.addEventListener('mousemove', function (e) {
		onMouseMove(e); }, false);
	ee.addEventListener('mousedown', function (e) {
		onMouseDown(e); }, false);
	ee.addEventListener('mouseup', function (e) {
		onMouseUp(e); }, false);

	function rotateScene(deltaX, deltaY) {
		Globus.rotation.y += deltaX / 100;
		Globus.rotation.x += deltaY / 100;
		pointsClouds.rotation.y += deltaX / 100;
		pointsClouds.rotation.x += deltaY / 100;
	} 
}
groupRotation()

animate = () => {

	window.requestAnimationFrame(animate);
	let time = clock.getElapsedTime();
	render(time);

	if (!Selected || flagToMove) {
		Globus.rotation.x -= 0.0003;
		Globus.rotation.y -= 0.0003;

		pointsClouds.rotation.x -= 0.0002;
		pointsClouds.rotation.y -= 0.0002;
	}

	CosmoDust.children.map((i,j)=>
		i.rotation.y = Date.now() * 0.0004
	)
}

window.requestAnimationFrame(animate);