/* ===========================================================
【001】DOM
=========================================================== */

"use strict";

/* ===========================================================
   DOM
=========================================================== */

const insideDialog =

    document.getElementById(

        "inside-dialog"

    );

const insideEditor =

    document.getElementById(

        "inside-editor"

    );

const btnInside =

    document.getElementById(

        "toggle-inside"

    );

/* ===========================================================
【002】App
=========================================================== */

const Inside={

    floor:1,

    rooms:[],

    selected:null,

    history:[],

    redo:[],

    zoom:1,

    grid:40,

    nextID:1

};

/* ===========================================================
【003】Floor
=========================================================== */

function changeFloor(

    floor

){

    Inside.floor=floor;

    renderRooms();

}

function currentRooms(){

    return Inside.rooms.filter(

        room=>

        room.floor===

        Inside.floor

    );

}

/* ===========================================================
【004】Room
=========================================================== */

/**
 * 教室作成
 */

function createRoom(

    type,

    name,

    x,

    y,

    width=120,

    height=80

){

    const room={

        id:"room-"+

            Inside.nextID++,

        floor:

            Inside.floor,

        type:type,

        name:name,

        x:x,

        y:y,

        width:width,

        height:height,

        rotation:0,

        color:"#ffffff",

        locked:false,

        visible:true

    };

    Inside.rooms.push(room);

    renderRooms();

    return room;

}

/**
 * 教室取得
 */

function getRoom(id){

    return Inside.rooms.find(

        room=>room.id===id

    );

}

/**
 * 教室削除
 */

function deleteRoom(id){

    Inside.rooms=

        Inside.rooms.filter(

            room=>room.id!==id

        );

    renderRooms();

}

/* ===========================================================
【005】Render
=========================================================== */

function renderRooms(){

    insideEditor.innerHTML="";

    currentRooms().forEach(

        room=>{

            drawRoom(room);

        }

    );

}

function drawRoom(room){

    const div=

        document.createElement(

            "div"

        );

    div.className=

        "inside-room";

    div.dataset.id=

        room.id;

    div.textContent=

        room.name;

    div.style.position=

        "absolute";

    div.style.left=

        room.x+"px";

    div.style.top=

        room.y+"px";

    div.style.width=

        room.width+"px";

    div.style.height=

        room.height+"px";

    div.style.background=

        room.color;

    div.style.transform=

        `rotate(${room.rotation}deg)`;

    if(

        room.locked

    ){

        div.classList.add(

            "locked"

        );

    }

    if(

        !room.visible

    ){

        div.style.display=

            "none";

    }

    insideEditor.appendChild(

        div

    );

}

/* ===========================================================
【006】Drag
=========================================================== */

let dragRoom=null;

let dragOffsetX=0;

let dragOffsetY=0;

/**
 * 教室選択・ドラッグ開始
 */

insideEditor.addEventListener(

    "pointerdown",

    event=>{

        const target=

            event.target.closest(

                ".inside-room"

            );

        if(!target){

            return;

        }

        const room=

            getRoom(

                target.dataset.id

            );

        if(!room){

            return;

        }

        if(room.locked){

            return;

        }

        Inside.selected=

            room.id;

        dragRoom=

            room;

        dragOffsetX=

            event.offsetX;

        dragOffsetY=

            event.offsetY;

    }

);

/**
 * ドラッグ中
 */

window.addEventListener(

    "pointermove",

    event=>{

        if(!dragRoom){

            return;

        }

        const rect=

            insideEditor.getBoundingClientRect();

        dragRoom.x=

            Math.round(

                (event.clientX-

                rect.left-

                dragOffsetX)

/Inside.grid

            )*Inside.grid;

        dragRoom.y=

            Math.round(

                (event.clientY-

                rect.top-

                dragOffsetY)

/Inside.grid

            )*Inside.grid;

        renderRooms();

    }

);

/**
 * ドラッグ終了
 */

window.addEventListener(

    "pointerup",

    ()=>{

        dragRoom=null;

    }

);


/* ===========================================================
【007】Dialog
=========================================================== */

btnInside.addEventListener(

    "click",

    ()=>{

        renderRooms();

        insideDialog.showModal();

    }

);

/* ===========================================================
【008】JSON
=========================================================== */

function exportInside(){

    const data={

        version:"1.0",

        rooms:Inside.rooms

    };

    return JSON.stringify(

        data,

        null,

        2

    );

}

function importInside(json){

    const data=

        JSON.parse(json);

    Inside.rooms=

        data.rooms||[];

    renderRooms();

}

/* ===========================================================
【009】Start
=========================================================== */

renderRooms();
