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

    saveInsideHistory();

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

    Inside.selected=room.id;

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

    saveInsideHistory();

    Inside.rooms=

        Inside.rooms.filter(

            room=>room.id!==id

        );

    if(

        Inside.selected===id

    ){

        Inside.selected=null;

    }

    renderRooms();

}

/**
 * 全削除
 */

function clearRooms(){

    saveInsideHistory();

    Inside.rooms=[];

    Inside.selected=null;

    renderRooms();

}

/* ===========================================================
【005】Render
=========================================================== */

/**
 * 全描画
 */

function renderRooms(){

    insideEditor.innerHTML="";

    currentRooms().forEach(

        room=>{

            drawRoom(room);

        }

    );

}

/**
 * 1部屋描画
 */

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

    if(

        Inside.selected===room.id

    ){

        div.classList.add(

            "selected"

        );

    }

    insideEditor.appendChild(

        div

    );

}

/**
 * 再描画
 */

function refreshInside(){

    renderRooms();

}

/* ===========================================================
【006】History
=========================================================== */

/**
 * 履歴保存
 */

function saveInsideHistory(){

    Inside.history.push(

        clone(

            Inside.rooms

        )

    );

    if(

        Inside.history.length>100

    ){

        Inside.history.shift();

    }

    Inside.redo=[];

}

/**
 * Undo
 */

function undoInside(){

    if(

        Inside.history.length===0

    ){

        return;

    }

    Inside.redo.push(

        clone(

            Inside.rooms

        )

    );

    Inside.rooms=

        Inside.history.pop();

    Inside.selected=null;

    refreshInside();

}

/**
 * Redo
 */

function redoInside(){

    if(

        Inside.redo.length===0

    ){

        return;

    }

    Inside.history.push(

        clone(

            Inside.rooms

        )

    );

    Inside.rooms=

        Inside.redo.pop();

    Inside.selected=null;

    refreshInside();

}

/**
 * 履歴削除
 */

function clearInsideHistory(){

    Inside.history=[];

    Inside.redo=[];

}

/* ===========================================================
【007】Selection
=========================================================== */

/**
 * 選択解除
 */

function clearRoomSelection(){

    Inside.selected=null;

    refreshInside();

}

/**
 * 教室選択
 */

function selectRoom(id){

    Inside.selected=id;

    refreshInside();

}

/**
 * 教室取得（選択中）
 */

function selectedRoom(){

    if(

        !Inside.selected

    ){

        return null;

    }

    return getRoom(

        Inside.selected

    );

}

/**
 * クリック選択
 */

insideEditor.addEventListener(

    "pointerdown",

    event=>{

        const room=

            event.target.closest(

                ".inside-room"

            );

        if(

            !room

        ){

            clearRoomSelection();

            return;

        }

        selectRoom(

            room.dataset.id

        );

    }

);

/* ===========================================================
【008】Drag
=========================================================== */

let roomDrag = null;

let roomOffsetX = 0;
let roomOffsetY = 0;

/**
 * ドラッグ開始
 */

insideEditor.addEventListener(

    "pointerdown",

    event=>{

        const target =

            event.target.closest(

                ".inside-room"

            );

        if(!target){

            return;

        }

        roomDrag =

            getRoom(

                target.dataset.id

            );

        if(!roomDrag){

            return;

        }

        saveInsideHistory();

        selectRoom(

            roomDrag.id

        );

        roomOffsetX =

            event.clientX -

            roomDrag.x;

        roomOffsetY =

            event.clientY -

            roomDrag.y;

    }

);

/**
 * ドラッグ中
 */

window.addEventListener(

    "pointermove",

    event=>{

        if(!roomDrag){

            return;

        }

        roomDrag.x =

            Math.round(

                (event.clientX - roomOffsetX)

                / Inside.grid

            ) * Inside.grid;

        roomDrag.y =

            Math.round(

                (event.clientY - roomOffsetY)

                / Inside.grid

            ) * Inside.grid;

        renderRooms();

    }

);

/**
 * ドラッグ終了
 */

window.addEventListener(

    "pointerup",

    ()=>{

        if(!roomDrag){

            return;

        }

        roomDrag = null;

        refreshInside();

    }

);

/* ===========================================================
【009】Button Event
=========================================================== */

/**
 * 校舎内部編集 開閉
 */

btnInside.addEventListener(

    "click",

    ()=>{

        if(

            insideDialog

        ){

            insideDialog.showModal();

            renderRooms();

        }

    }

);


/**
 * 教室追加テスト
 */

function addInsideRoom(){

    createRoom(

        "room",

        "教室",

        40,

        40

    );

}


/**
 * 削除
 */

function deleteSelectedRoom(){

    if(

        !Inside.selected

    ){

        return;

    }

    deleteRoom(

        Inside.selected

    );

}


/**
 * Undo / Redo

 */

function insideUndo(){

    undoInside();

}


function insideRedo(){

    redoInside();

}


/**
 * キーボード操作
 */

window.addEventListener(

    "keydown",

    event=>{

        if(

            !insideDialog ||

            !insideDialog.open

        ){

            return;

        }


        if(

            event.key==="Delete"

        ){

            deleteSelectedRoom();

        }


        if(

            event.ctrlKey &&

            event.key.toLowerCase()==="z"

        ){

            event.preventDefault();

            insideUndo();

        }


        if(

            event.ctrlKey &&

            event.key.toLowerCase()==="y"

        ){

            event.preventDefault();

            insideRedo();

        }

    }

);

/* ===========================================================
【010】Zoom / Grid
=========================================================== */

/**
 * ズーム変更
 */

function setInsideZoom(value){

    Inside.zoom =

        Math.min(

            3,

            Math.max(

                0.25,

                value

            )

        );

    insideEditor.style.transform=

        `scale(${Inside.zoom})`;

    insideEditor.style.transformOrigin=

        "top left";

}


/**
 * グリッド吸着
 */

function snapInside(value){

    return Math.round(

        value / Inside.grid

    ) * Inside.grid;

}


/**
 * ズームイン

 */

function zoomInsideIn(){

    setInsideZoom(

        Inside.zoom + 0.1

    );

}


/**
 * ズームアウト

 */

function zoomInsideOut(){

    setInsideZoom(

        Inside.zoom - 0.1

    );

}


/**
 * 初期化

 */

function initializeInside(){

    setInsideZoom(

        1

    );

    renderRooms();

}

/* ===========================================================
【011】Start
=========================================================== */

/**
 * 内部エディタ初期化
 */

function initializeInside(){

    Inside.floor = 1;

    Inside.rooms = [];

    Inside.selected = null;

    Inside.history = [];

    Inside.redo = [];

    Inside.zoom = 1;

    Inside.nextID = 1;

    setInsideZoom(

        1

    );

    renderRooms();

}


/**
 * 起動
 */

initializeInside();
