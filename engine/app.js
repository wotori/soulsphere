import * as THREE from 'three'
import TWEEN from '@tweenjs/tween.js';
import $ from 'jquery';

import { users_data } from './users_data'
import * as users_pics from '../userdata/pic/*.png'
// console.log(users_data, users_pics)



const buildMsg = "brave new babel + antispasm";
console.log(
  "%c BUILD %c" + buildMsg,
  "background: gold; color: darkgreen",
  "background: green; color: white"
); //Fetch USERS and cache their pics

let USERS; //init Users

let newFetchedPic = (index) => {
  let pic_path = users_pics['Frame-' + index]
  console.log(pic_path)
  return new THREE.TextureLoader().load(pic_path);
}


var timeNow = new Date();
console.log(timeNow);

function getUsers(data) {
  USERS = data

  USERS.map((i) => {
    +i.pic >= 0 ? (i.fetchedPic = newFetchedPic(i.pic)) : void null
  }
  ); //Cache for unexisting users

  const USERSexist = USERS.map(i => i.pic);
  console.time();

  for (let picindex = 0; picindex <= 62; picindex++)
    USERSexist.indexOf(picindex) == -1 ?
      USERS.push({
        //Load all 62 textures
        name: "id" + picindex,
        location: "London",
        pic: picindex,
        fetchedPic: newFetchedPic(picindex),
        audio: "https://cdn.glitch.com/ff820234-7fc5-4317-a00a-ad183b72978d%2Fmoonlight.mp3?1512000557559"
      }) :
      void null;

  console.timeEnd();
  USERS.sort((a, b) => a.pic - b.pic); // console.table(USERS);
};

getUsers(users_data);
// getUsers.send(); //Audio
//Init ctx

function startSphere() {
  //SET DAY TIME
  //DayNightMechanics
  var dayTime = "sun";
  var d = new Date();
  var curMin = d.getSeconds();
  // if (curMin % 2 == 0) {
  //   dayTime = "sun";
  //   var TorF = true;
  //   var alphaTOF = false;
  //   //set Backgound
  //   var loader = new THREE.TextureLoader();
  //   loader.load("https://i.ibb.co/60CGggV/sphereBG.jpg", function(texture) {
  //     scene.background = texture;
  //   });
  // } else {
  //   dayTime = "moon";
  //   var alphaTOF = true;
  //   var TorF = true;
  //   $(".sphere-section").css({
  //     background:
  //       "radial-gradient(circle, rgb(39, 38, 52) 0%, rgba(22,22,39,1) 100%);"
  //   });
  // }
  dayTime = "moon";
  var alphaTOF = true;
  var TorF = true;
  $(".sphere-section").css({
    background: "radial-gradient(circle, rgb(39, 38, 52) 0%, rgba(22,22,39,1) 100%);"
  });
  console.log(dayTime, curMin);

  let initialResume = false;
  let ctx;
  let audioSrc;
  let analyser;
  let audio = $("#audio")[0]; // This gets the exact lenght of the stroke (.stroke) around the play icon

  let stroke = $(".stroke")[0];
  let strokeLength = stroke.getTotalLength();
  console.log(strokeLength); // Toggle the animation-play-state of the ".stroke" on clicking the ".playicon" -container

  let playIcon = $(".playicon");
  let play = $(".play");
  let pause = $(".pause");

  audio.stop = () => {
    audio.pause();
    audio.currentTime = 0;
  };

  audio.canPlay = false;
  audio.playState = "paused";
  $("audio").on("canplaythrough", () => (audio.canPlay = true));
  playIcon.click(() => {
    if (audio.playState == "paused" || audio.playState == "") {
      pause.removeClass("hidden");
      play.addClass("hidden");
      audio.playState = "running";
      audio.play();
    } else if (audio.playState == "running") {
      play.removeClass("hidden");
      pause.addClass("hidden");
      audio.playState = "paused"; // Logging the animation-play-state to the console:

      audio.stop();
    }

    log(audio.playState);
  }); //

  let RUNNING_INDEXES = [];
  let scene = new THREE.Scene();
  let camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.01,
    1000
  );
  let raycaster = new THREE.Raycaster();
  raycaster.params.Points.threshold = 0.07;
  let raycasterPlanes = new THREE.Raycaster();
  raycasterPlanes.params.Points.threshold = 0.0001;
  let sectsWithPlanes;
  let Info = $(".info");
  let Descript = $(".descripto");
  let DescriptName = $("#name")[0];
  let DescriptLocation = $("#location")[0];
  let MOUSE = new THREE.Vector2();
  let clock = new THREE.Clock();
  let picindex = 0,
    looped_picindex = false;
  let PLANE_GROUP = new THREE.Group();
  scene.add(PLANE_GROUP);
  let windowX = window.innerWidth / 2;
  let windowY = window.innerHeight / 2;
  camera.position.set(0, 0, 9); //GLOBAL EVENTS

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  const onMouseMove = event => {
    event.preventDefault();
    MOUSE.x = (event.clientX / window.innerWidth) * 2 - 1;
    MOUSE.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(MOUSE, camera);
  };

  let Selected, preSelected;
  let focusPlaneName = -1; // Home view by default, no Plane clicked

  const onMouseClick = event => {
    if (!initialResume) {
      //Google audio policy
      initialResume = true;
      ctx = new AudioContext();
      audioSrc = ctx.createMediaElementSource(audio);
      audioSrc.connect(ctx.destination);
      analyser = ctx.createAnalyser();
      audioSrc.connect(analyser);
      ctx.resume().then(() => {
        log("Context resumed successfully");
      });
    }

    if (sectsWithPlanes[0]) {
      //Home && Plane
      Selected = sectsWithPlanes[0].object;
      DescriptName.innerHTML = Selected.info.name;
      DescriptLocation.innerHTML = Selected.info.location;
      audio.src = Selected.info.audio;
      audio.canPlay = false;
      audio.load();
      Info.removeClass("hidden");
      Info.addClass("appear");
      pause.addClass("hidden");
      play.removeClass("hidden");
      audio.playState = "paused"; // audio.playState = "paused"

      camTweenOut && camTweenOut.stop();
      preSelected &&
        ((preSelected.dissolving = true),
          preSelected.camTweenFocusMe.stop(),
          (preSelected.resizingChain = true));
      preSelected = Selected;
      Selected.dissolving = false;
      focusPlaneName = Selected.name; //camFocusme

      Selected.camFocusMe().start(); //focus

      Selected.resizingChain = false;
      Global.map((i, j) => {
        i.to1.stop(), i.to0.start();
        line_to1.stop(), line_to0.start();
        points_to1.stop(), points_to0.start();
      });
      CosmoDust.to1();
    } else if (event.target.tagName == "CANVAS") {
      // Move out
      focusPlaneName = -1;

      Selected &&
        (Selected.camTweenFocusMe.stop(),
          (Selected.dissolving = true),
          (Selected.resizingChain = true)); //Tweens activate

      camTweenOut.start();
      Global.map((i, j) => {
        i.to0.stop(), i.to1.start();
        line_to0.stop(), line_to1.start();
        points_to0.stop(), points_to1.start();
      });
      CosmoDust.to0();
      Info.addClass("hidden");
      pause.addClass("hidden");
      play.removeClass("hidden");
      audio.playState = "paused";
      audio.stop();
    }
  }; //GLOBAL FUNCTIONS

  const log = s => console.log(s);

  const ConvertToWorld = index => {
    return pointsClouds.geometry.vertices[index]
      .clone()
      .applyMatrix4(pointsClouds.matrixWorld);
  };

  const createCanvasMaterial = (color, size) => {
    var matCanvas = document.createElement("canvas");
    matCanvas.width = matCanvas.height = size;
    var matContext = matCanvas.getContext("2d"); // create exture object from canvas.

    var texture = new THREE.Texture(matCanvas); // Draw a circle

    var center = size / 2;
    matContext.beginPath();
    matContext.arc(center, center, size / 2, 0, 2 * Math.PI, false);
    matContext.closePath();
    matContext.fillStyle = color;
    matContext.fill(); // need to set needsUpdate

    texture.needsUpdate = true; // return a texture made from the canvas

    return texture;
  };

  let camTweenOut = new TWEEN.Tween(camera.position)
    .to({
      x: 0,
      y: 0,
      z: 9
    },
      1000
    )
    .easing(TWEEN.Easing.Quadratic.InOut);

  let renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    canvas: canvasSphere
  });

  // renderer.setClearAlpha(1)

  renderer.domElement.id = "canvasSphere";
  let container = document.getElementById("canvasSphere");
  document.body.appendChild(container);

  //Background Color
  // renderer.setClearColor('#13131b', 1);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const parameters = [
    [
      [1, 1, 1], 0.9
    ],
    [
      [0.95, 1, 0.5], 1
    ],
    [
      [0.9, 1, 0.5], 1.4
    ],
    [
      [0.85, 1, 0.5], 1.1
    ],
    [
      [1, 1, 1], 0.8
    ]
  ];
  const parameterCount = parameters.length;
  let DustGeometry = new THREE.Geometry();
  /*	NO ONE SAID ANYTHING ABOUT MATH! UGH!	*/

  const bg_particles_count = 1000;
  /* Leagues under the sea */
  //Particles

  for (let i = 0; i < bg_particles_count; i++) {
    var vertex = new THREE.Vector3();
    vertex.x = Math.random() * 2000 - 1000;
    vertex.y = Math.random() * 2000 - 1000;
    vertex.z = Math.random() * 2000 - 1000;
    DustGeometry.vertices.push(vertex);
  }

  let CosmoDust = new THREE.Group();
  let DustMaterials = [];

  for (let i = 0; i < parameterCount; i++) {
    const color = parameters[i][0];
    const size = parameters[i][1];
    DustMaterials[i] = new THREE.PointsMaterial({
      size: size,
      map: createCanvasMaterial("white", 256),
      transparent: true,
      depthWrite: true,
      opacity: 0
    });
    let particles = new THREE.Points(DustGeometry, DustMaterials[i]);
    particles.rotation.x = Math.random() * 6;
    particles.rotation.y = Math.random() * 6;
    particles.rotation.z = Math.random() * 6;
    CosmoDust.add(particles);
  }

  scene.add(CosmoDust); //globus

  //SoulSphere
  let SphereGeometry = new THREE.IcosahedronGeometry(1.75, 1);
  let SphereMaterial = new THREE.MeshPhongMaterial({
    color: "white",
    transparent: true
  });
  let SphereMesh = new THREE.Mesh(SphereGeometry, SphereMaterial);
  SphereMaterial.flatShading = true;

  //SoulSphere wireFrame // colors: ['white' & #E7CEA9] [0.04, 100]
  let wireOp;
  let wirePresets = [0.04, 0.3, "white", "#E7CEA9"];
  let lineMat = new THREE.LineBasicMaterial({
    color: wirePresets[3]
  });
  let geometryWire = new THREE.IcosahedronBufferGeometry(2.2, 1);
  let wireframe = new THREE.WireframeGeometry(geometryWire);
  let line = new THREE.LineSegments(wireframe, lineMat);
  line.material.opacity = 0.3;
  line.material.transparent = true; //pointClouds
  if (dayTime == "sun") {
    line.material.color.set(wirePresets[3]);
    line.material.opacity = wirePresets[1];
    wireOp = wirePresets[1];
  } else {
    line.material.color.set(wirePresets[2]);
    line.material.opacity = wirePresets[0];
    wireOp = wirePresets[0];
  }
  scene.add(line);

  //Create Points for AvatarCircles START //opacity:0.33 & 0.8
  let pointGeo = new THREE.SphereGeometry(3.5, 17, 17);
  let pointMat = new THREE.PointsMaterial({
    size: 0.04,
    opacity: 0.8,
    map: createCanvasMaterial("white", 256),
    transparent: true,
    depthWrite: false,
    color: "white"
  });
  pointGeo.vertices.forEach(function (vertex) {
    vertex.x += Math.random();
    vertex.y += Math.random();
    vertex.z += Math.random();
  });

  //Create Points for AvatarCircles START
  let pointOp;
  let pointsClouds = new THREE.Points(pointGeo, pointMat);
  let Globus = new THREE.Group();
  Globus.add(SphereMesh);
  let GlobusAndPoints = new THREE.Group();
  if (dayTime == "sun") {
    pointOp = 0.8;
    pointsClouds.material.opacity = pointOp;
    pointsClouds.material.color.set("#F2AF5C");
  } else {
    pointOp = 0.33;
    pointsClouds.material.opacity = pointOp;
  }

  GlobusAndPoints.add(Globus, pointsClouds); // scene.add(Globus);
  scene.add(GlobusAndPoints);

  //sphereEnvPresets
  let lightPresets = {
    sun: ["#e58237", 1.2, 1.85],
    moon: ["#E2E0F4", 0.85, 0.65],
    whiteBack: [1, 2, 3]
  }; //color, ambientLight, pointLight
  var dayTime = "sun";
  var d = new Date();
  var curMin = d.getSeconds();
  if (curMin % 2 == 0) {
    dayTime = "sun";
    document.body.style.cssText =
      "background: radial-gradient(circle, rgba(48,32,27,1) 0%, rgba(22,22,39,1) 100%);";
  } else {
    dayTime = "moon";
    document.body.style.cssText =
      "background: radial-gradient(circle, rgb(39, 38, 52) 0%, rgba(22,22,39,1) 100%);";
  }
  console.log(dayTime, curMin);
  var lightColor = [
    lightPresets[dayTime][0],
    lightPresets[dayTime][1],
    lightPresets[dayTime][2]
  ]; //Yellow

  //createLight
  let light = new THREE.PointLight(lightColor[0], lightColor[2], 15);
  scene.add(light);
  light.position.set(0, 0, 12);

  //ambient light
  var envLight = new THREE.AmbientLight(lightColor[0], lightColor[1]);
  scene.add(envLight);

  document.addEventListener("mousemove", onMouseMove, false);
  document.addEventListener("mouseup", onMouseClick, false); //OPACITY TWEENS

  CosmoDust.opacity1 = [];
  CosmoDust.opacity0 = [];
  CosmoDust.children.map(i => {
    CosmoDust.opacity0.push(
      new TWEEN.Tween(i.material)
        .to({
          opacity: 0
        },
          2000
        )
        .easing(TWEEN.Easing.Exponential.Out)
    );
    CosmoDust.opacity1.push(
      new TWEEN.Tween(i.material)
        .to({
          opacity: 1
        },
          2000
        )
        .easing(TWEEN.Easing.Exponential.Out)
    );
  });

  CosmoDust.to0 = () => {
    CosmoDust.opacity1.map(i => i.end());
    CosmoDust.opacity0.map(i => i.start());
  };

  CosmoDust.to1 = () => {
    CosmoDust.opacity0.map(i => i.end());
    CosmoDust.opacity1.map(i => i.start());
  };

  let Global = [Globus.children[0]];
  Global.map((i, j) => {
    i.to0 = new TWEEN.Tween(i.material)
      .to({
        opacity: 0
      },
        1500
      )
      .easing(TWEEN.Easing.Exponential.Out)
      .onComplete(() => (i.visible = false));
    i.to1 = new TWEEN.Tween(i.material)
      .to({
        opacity: 1
      },
        2000
      )
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onStart(() => (i.visible = true));
    Globus.children[0];
  });

  let line_to0 = new TWEEN.Tween(line.material)
    .to({
      opacity: 0
    }, 1500)
    .easing(TWEEN.Easing.Exponential.Out)
    .onComplete(() => (line.visible = false));
  let line_to1 = new TWEEN.Tween(line.material)
    .to({
      opacity: wireOp
    }, 2000)
    .easing(TWEEN.Easing.Quadratic.InOut)
    .onStart(() => (line.visible = true));

  let points_to0 = new TWEEN.Tween(pointsClouds.material)
    .to({
      opacity: 0
    }, 1500)
    .easing(TWEEN.Easing.Exponential.Out)
    .onComplete(() => (pointMat.visible = false));
  let points_to1 = new TWEEN.Tween(pointsClouds.material)
    .to({
      opacity: pointOp
    }, 2000)
    .easing(TWEEN.Easing.Quadratic.InOut)
    .onStart(() => (pointMat.visible = true));

  window.addEventListener("resize", onWindowResize, false); // getUserDescript =(index)=> USERS.find((e)=> e.pic == index);
  //RENDER

  const render = time => {
    TWEEN.update();

    if (!audio.canPlay) {
      // stroke.style.animation = "dash 1.8s linear infinite paused";
      // log('loading')
    } else {
      // stroke.style.animation = "";
    }

    raycasterPlanes.setFromCamera(MOUSE, camera);
    sectsWithPlanes = raycasterPlanes.intersectObjects(
      PLANE_GROUP.children,
      true
    );
    sectsWithPlanes[0] ?
      (document.body.style.cursor = "pointer") :
      (document.body.style.cursor = "default");

    if (focusPlaneName == -1) {
      //Home view
      let sectsWithPoints = raycaster.intersectObjects([pointsClouds]);

      if (sectsWithPoints[0]) {
        //cursor on a point
        if (RUNNING_INDEXES.indexOf(sectsWithPoints[0].index) == -1) {
          //Check point for existence
          picindex < 61 ?
            picindex++
            :
            ((picindex = 0), (looped_picindex = true)); // log(RUNNING_INDEXES);

          RUNNING_INDEXES.push(sectsWithPoints[0].index);
          let newPlane = new PlaneAvatar(
            PLANE_GROUP,
            sectsWithPoints[0].index,
            !looped_picindex ?
              USERS[picindex] :
              Object.assign(USERS[picindex], {
                name: "id" + sectsWithPoints[0].index,
                location: "London",
                audio: "https://cdn.glitch.com/ff820234-7fc5-4317-a00a-ad183b72978d%2Fmoonlight.mp3?1512000557559"
              })
          );
          newPlane.scale.set(0.001, 0.001, 0.001);
          newPlane.enlargeTween.start();
          PLANE_GROUP.add(newPlane);
        } else {
          let planeToEnlarge = PLANE_GROUP.children.find(
            e => e.name == sectsWithPoints[0].index
          );
          planeToEnlarge != undefined ?
            (planeToEnlarge.dissolving = false) :
            void null;
        }
      }

      if (sectsWithPlanes[0]) {
        //Enlarge existing one not dissolved Plane
        let planeToEnlarge = sectsWithPlanes[0].object;
        planeToEnlarge.dissolving = false; //flag to enlarge
      }
    }

    PLANE_GROUP.children.map((i, j) => {
      i.run(ConvertToWorld(i.name)); //change Plane position

      i.updateSize(); //every Plane size update
    }); //FIND INTERSECTION

    camera.updateMatrixWorld();
    renderer.render(scene, camera);
  };

  pointsClouds.geometry.verticesNeedUpdate = true;
  pointsClouds.matrixAutoUpdate = true;

  class PlaneAvatar extends THREE.Mesh {
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
      }; // console.table(this.info)

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

  //Rotation Function
  function groupRotation() {
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
      rotateScene(deltaX / 7, deltaY / 7);
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

    var ee = document.body.appendChild(container);
    ee.addEventListener(
      "mousemove",
      function (e) {
        onMouseMove(e);
      },
      false
    );
    ee.addEventListener(
      "mousedown",
      function (e) {
        onMouseDown(e);
      },
      false
    );
    ee.addEventListener(
      "mouseup",
      function (e) {
        onMouseUp(e);
      },
      false
    );

    function rotateScene(deltaX, deltaY) {
      Globus.rotation.y += deltaX / 100;
      Globus.rotation.x += deltaY / 100;
      line.rotation.y += deltaX / 100;
      line.rotation.x += deltaY / 100;
      pointsClouds.rotation.y += deltaX / 100;
      pointsClouds.rotation.x += deltaY / 100;
    }
  }

  groupRotation();

  const animate = () => {
    window.requestAnimationFrame(animate);
    let time = clock.getElapsedTime();
    render(time);

    if (!Selected || focusPlaneName == -1) {
      Globus.rotation.x -= 0.0003;
      Globus.rotation.y -= 0.0003;
      pointsClouds.rotation.x -= 0.0002;
      pointsClouds.rotation.y -= 0.0002;
    }

    CosmoDust.children.map((i, j) => (i.rotation.y = Date.now() * 0.0004));
  };

  window.requestAnimationFrame(animate);
}

startSphere();