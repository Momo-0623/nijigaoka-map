/* ===========================================================
【001】DOM
=========================================================== */

"use strict";

/* ===========================================================
   Main
=========================================================== */

const canvas = document.getElementById("canvas");
const canvasScroll = document.getElementById("canvas-scroll");

const objectLayer = document.getElementById("object-layer");
const selectionLayer = document.getElementById("selection-layer");
const guideLayer = document.getElementById("guide-layer");
const previewLayer = document.getElementById("preview-layer");

/* ===========================================================
   Sidebar
=========================================================== */

const layerList = document.getElementById("layer-list");
const historyPanel = document.getElementById("history-panel");

/* ===========================================================
   Property
=========================================================== */

const propertyName = document.getElementById("property-name");
const propertyType = document.getElementById("property-type");

const propertyX = document.getElementById("property-x");
const propertyY = document.getElementById("property-y");

const propertyWidth = document.getElementById("property-width");
const propertyHeight = document.getElementById("property-height");

const propertyRotate = document.getElementById("property-rotate");
const propertyOpacity = document.getElementById("property-opacity");

/* ===========================================================
   Status
=========================================================== */

const statusZoom = document.getElementById("status-zoom");
const statusX = document.getElementById("status-x");
const statusY = document.getElementById("status-y");
const statusSelected = document.getElementById("status-selected");
const statusSave = document.getElementById("status-save");

/* ===========================================================
   Toast
=========================================================== */

const toastContainer =
    document.getElementById("toast-container");

/* ===========================================================
   File
=========================================================== */

const jsonLoader =
    document.getElementById("json-loader");

/* ===========================================================
【002】Buttons
=========================================================== */

const btnNew =
    document.getElementById("new-map");

const btnSave =
    document.getElementById("save-map");

const btnLoad =
    document.getElementById("load-map");

const btnPNG =
    document.getElementById("export-png");

const btnSetting =
    document.getElementById("open-settings");

const btnUndo =
    document.getElementById("undo");

const btnRedo =
    document.getElementById("redo");

const btnCopy =
    document.getElementById("copy");

const btnPaste =
    document.getElementById("paste");

const btnDelete =
    document.getElementById("delete");

const btnZoomIn =
    document.getElementById("zoom-in");

const btnZoomOut =
    document.getElementById("zoom-out");

const btnGrid =
    document.getElementById("toggle-grid");

const btnInside =
    document.getElementById("toggle-inside");

/* ===========================================================
【003】App
=========================================================== */

const App = {

    version : "1.0",

    gridSize : 40,

    zoom : 1,

    gridVisible : true,

    objects : [],

    selected : [],

    clipboard : [],

    history : [],

    redo : [],

    autoSave : true,

    nextID : 1

};

/* ===========================================================
【004】Utility
=========================================================== */

/**
 * オブジェクトID生成
 */

function generateID(){

    return "obj-" + App.nextID++;

}

/**
 * グリッドへ吸着
 */

function snap(value){

    return Math.round(

        value / App.gridSize

    ) * App.gridSize;

}

/**
 * 範囲制限
 */

function clamp(value,min,max){

    return Math.min(

        max,

        Math.max(

            min,

            value

        )

    );

}

/**
 * 深いコピー
 */

function clone(data){

    return structuredClone(data);

}

/**
 * ランダム文字列
 */

function randomString(length=8){

    return Math.random()

        .toString(36)

        .substring(2,2+length);

}

/**
 * 保存状態更新
 */

function updateSaveStatus(text){

    statusSave.textContent=text;

}

/**
 * 選択数更新
 */

function updateSelectedCount(){

    statusSelected.textContent=

        App.selected.length;

}

/**
 * ズーム表示更新
 */

function updateZoomLabel(){

    statusZoom.textContent=

        Math.round(

            App.zoom*100

        )+"%";

}

/* ===========================================================
【005】Toast
=========================================================== */

function showToast(

    message,

    type="success",

    duration=3000

){

    const toast=

        document.createElement("div");

    toast.className=

        "toast "+type;

    toast.textContent=

        message;

    toastContainer.appendChild(

        toast

    );

    setTimeout(()=>{

        toast.style.opacity="0";

        setTimeout(()=>{

            toast.remove();

        },250);

    },duration);

}

/* ===========================================================
【006】History
=========================================================== */

/**
 * 現在状態保存
 */

function saveHistory(){

    App.history.push(

        clone(

            App.objects

        )

    );

    if(

        App.history.length>100

    ){

        App.history.shift();

    }

    App.redo=[];

}

/**
 * Undo
 */

function undo(){

    if(

        App.history.length===0

    ){

        return;

    }

    App.redo.push(

        clone(

            App.objects

        )

    );

    App.objects=

        App.history.pop();

}

/**
 * Redo
 */

function redo(){

    if(

        App.redo.length===0

    ){

        return;

    }

    App.history.push(

        clone(

            App.objects

        )

    );

    App.objects=

        App.redo.pop();

}

/**
 * 履歴表示
 */

function refreshHistory(){

    historyPanel.innerHTML="";

    App.history

        .slice()

        .reverse()

        .forEach((item,index)=>{

            const div=

                document.createElement(

                    "div"

                );

            div.className=

                "history-item";

            div.textContent=

                "履歴 "

                +(App.history.length-index);

            historyPanel.appendChild(

                div

            );

        });

}

/* ===========================================================
【007】Object
=========================================================== */

/**
 * オブジェクト作成
 */

function createObject(type,name,x,y){

    saveHistory();

    const object={

        id:generateID(),

        type:type,

        name:name,

        x:snap(x),

        y:snap(y),

        width:120,

        height:60,

        rotation:0,

        opacity:100,

        visible:true,

        locked:false,

        floor:1,

        z:App.objects.length+1

    };

    App.objects.push(object);

    renderObjects();

    updateSaveStatus("未保存");

    showToast("追加しました");

    return object;

}

/**
 * ID検索
 */

function getObject(id){

    return App.objects.find(

        object=>object.id===id

    );

}

/**
 * 削除
 */

function deleteObject(id){

    saveHistory();

    App.objects=

        App.objects.filter(

            object=>object.id!==id

        );

    renderObjects();

}

/**
 * 全削除
 */

function clearObjects(){

    saveHistory();

    App.objects=[];

    App.selected=[];

    renderObjects();

}

/* ===========================================================
【008】Render
=========================================================== */

/**
 * 全描画
 */

function renderObjects(){

    objectLayer.innerHTML="";

    App.objects.forEach(

        object=>{

            drawObject(object);

        }

    );

}

/**
 * 1個描画
 */

function drawObject(object){

    const div=

        document.createElement("div");

    div.className="map-object";

    div.dataset.id=object.id;

    div.textContent=object.name;

    div.style.left=

        object.x+"px";

    div.style.top=

        object.y+"px";

    div.style.width=

        object.width+"px";

    div.style.height=

        object.height+"px";

    div.style.transform=

        `rotate(${object.rotation}deg)`;

    div.style.opacity=

        object.opacity/100;

    div.style.zIndex=

        object.z;

    if(!object.visible){

        div.classList.add("hidden");

    }

    if(object.locked){

        div.classList.add("locked");

    }

    if(

        App.selected.includes(object.id)

    ){

        div.classList.add("selected");

    }

    objectLayer.appendChild(div);

}

/**
 * 再描画
 */

function refresh(){

    renderObjects();

    refreshLayer();

    refreshHistory();

    updateSelectedCount();

    updateZoomLabel();

  updateProperty();

}

/* ===========================================================
【009】Layer
=========================================================== */

function refreshLayer(){

    layerList.innerHTML="";

    [...App.objects]

        .reverse()

        .forEach(object=>{

            const row=

                document.createElement(

                    "div"

                );

            row.className=

                "layer-item";

            row.dataset.id=

                object.id;

            row.innerHTML=`

<span class="layer-visible">

${object.visible?"👁":"🚫"}

</span>

<span class="layer-lock">

${object.locked?"🔒":"🔓"}

</span>

<span class="layer-name">

${object.name}

</span>

<span>

☰

</span>

`;

            layerList.appendChild(row);

        });

}

/* ===========================================================
【010】Selection
=========================================================== */

/**
 * 選択解除
 */

function clearSelection(){

    App.selected=[];

    refresh();

}

/**
 * 選択
 */

function selectObject(id,add=false){

    if(!add){

        App.selected=[];

    }

    if(!App.selected.includes(id)){

        App.selected.push(id);

    }

    refresh();

}

/**
 * 選択解除（単体）
 */

function deselectObject(id){

    App.selected=

        App.selected.filter(

            objectID=>objectID!==id

        );

    refresh();

}

/**
 * 全選択
 */

function selectAll(){

    App.selected=

        App.objects.map(

            object=>object.id

        );

    refresh();

}

/* ===========================================================
【011】Drag
=========================================================== */

let dragTarget=null;

let dragOffsetX=0;
let dragOffsetY=0;

/**
 * ドラッグ開始
 */

objectLayer.addEventListener(

    "pointerdown",

    event=>{

        const target=

            event.target.closest(

                ".map-object"

            );

        if(!target){

            return;

        }

        const id=

            target.dataset.id;

        selectObject(

            id,

            event.ctrlKey

        );

        dragTarget=

            getObject(id);

        if(!dragTarget){

            return;

        }

        dragOffsetX=

            event.clientX-dragTarget.x;

        dragOffsetY=

            event.clientY-dragTarget.y;

    }

);

/**
 * ドラッグ中
 */

window.addEventListener(

    "pointermove",

    event=>{

        if(!dragTarget){

            return;

        }

        dragTarget.x=

            snap(

                event.clientX-

                dragOffsetX

            );

        dragTarget.y=

            snap(

                event.clientY-

                dragOffsetY

            );

        renderObjects();

    }

);

/**
 * ドラッグ終了
 */

window.addEventListener(

    "pointerup",

    ()=>{

        if(!dragTarget){

            return;

        }

        saveHistory();

        updateSaveStatus(

            "未保存"

        );

        dragTarget=null;

        refresh();

    }

);

/* ===========================================================
【012】Property
=========================================================== */

function updateProperty(){

    if(App.selected.length!==1){

        propertyName.value="";

        propertyType.textContent="-";

        propertyX.value="";

        propertyY.value="";

        propertyWidth.value="";

        propertyHeight.value="";

        propertyRotate.value="";

        propertyOpacity.value=100;

        return;

    }

    const object=

        getObject(

            App.selected[0]

        );

    if(!object){

        return;

    }

    propertyName.value=

        object.name;

    propertyType.textContent=

        object.type;

    propertyX.value=

        object.x;

    propertyY.value=

        object.y;

    propertyWidth.value=

        object.width;

    propertyHeight.value=

        object.height;

    propertyRotate.value=

        object.rotation;

    propertyOpacity.value=

        object.opacity;

}

/* ===========================================================
【013】Building
=========================================================== */

/**
 * 建物追加
 */

function addBuilding(name){

    createObject(

        "building",

        name,

        80,

        80

    );

}

/**
 * 教室追加
 */

function addRoom(name){

    createObject(

        "room",

        name,

        80,

        80

    );

}

/**
 * 建物一覧クリック
 */

document

.querySelectorAll(

    "#building-list .tool-item"

)

.forEach(item=>{

    item.addEventListener(

        "click",

        ()=>{

            addBuilding(

                item.dataset.name

            );

        }

    );

});

/**
 * 教室一覧クリック
 */

document

.querySelectorAll(

    "#room-list .tool-item"

)

.forEach(item=>{

    item.addEventListener(

        "click",

        ()=>{

            addRoom(

                item.dataset.name

            );

        }

    );

});

/* ===========================================================
【014】Keyboard
=========================================================== */

window.addEventListener(

    "keydown",

    event=>{

        /* Delete */

        if(event.key==="Delete"){

            App.selected.forEach(

                id=>deleteObject(id)

            );

            clearSelection();

        }

        /* Ctrl+A */

        if(

            event.ctrlKey &&

            event.key.toLowerCase()==="a"

        ){

            event.preventDefault();

            selectAll();

        }

    }

);

/* ===========================================================
【015】Undo / Redo
=========================================================== */

btnUndo.addEventListener(

    "click",

    ()=>{

        undo();

        refresh();

    }

);

btnRedo.addEventListener(

    "click",

    ()=>{

        redo();

        refresh();

    }

);

window.addEventListener(

    "keydown",

    event=>{

        if(

            event.ctrlKey &&

            event.key.toLowerCase()==="z"

        ){

            event.preventDefault();

            undo();

            refresh();

        }

        if(

            event.ctrlKey &&

            event.key.toLowerCase()==="y"

        ){

            event.preventDefault();

            redo();

            refresh();

        }

    }

);

/* ===========================================================
【016】Copy / Paste
=========================================================== */

/**
 * コピー
 */

function copySelection(){

    App.clipboard=[];

    App.selected.forEach(id=>{

        const object=getObject(id);

        if(object){

            App.clipboard.push(

                clone(object)

            );

        }

    });

    showToast("コピーしました");

}

/**
 * 貼り付け
 */

function pasteSelection(){

    if(App.clipboard.length===0){

        return;

    }

    saveHistory();

    clearSelection();

    App.clipboard.forEach(item=>{

        const copy=clone(item);

        copy.id=generateID();

        copy.x+=40;

        copy.y+=40;

        copy.z=App.objects.length+1;

        App.objects.push(copy);

        App.selected.push(copy.id);

    });

    refresh();

    updateSaveStatus("未保存");

    showToast("貼り付けました");

}

/* ===========================================================
【017】JSON Save / Load
=========================================================== */

/**
 * 保存
 */

function saveJSON(){

    const json={

        version:App.version,

        objects:App.objects

    };

    const blob=new Blob(

        [

            JSON.stringify(

                json,

                null,

                2

            )

        ],

        {

            type:"application/json"

        }

    );

    const url=

        URL.createObjectURL(blob);

    const a=

        document.createElement("a");

    a.href=url;

    a.download="nijigaoka-map.json";

    a.click();

    URL.revokeObjectURL(url);

    updateSaveStatus("保存済み");

    showToast("保存しました");

}

/**
 * 読込
 */

function loadJSON(file){

    const reader=

        new FileReader();

    reader.onload=()=>{

        const json=

            JSON.parse(

                reader.result

            );

        App.objects=

            json.objects||[];

        refresh();

        showToast("読み込みました");

    };

    reader.readAsText(file);

}

/* ===========================================================
【018】Button Event
=========================================================== */

btnCopy.addEventListener(

    "click",

    copySelection

);

btnPaste.addEventListener(

    "click",

    pasteSelection

);

btnSave.addEventListener(

    "click",

    saveJSON

);

btnLoad.addEventListener(

    "click",

    ()=>{

        jsonLoader.click();

    }

);

jsonLoader.addEventListener(

    "change",

    event=>{

        if(

            event.target.files.length===0

        ){

            return;

        }

        loadJSON(

            event.target.files[0]

        );

    }

);

/* ===========================================================
【019】PNG Export
=========================================================== */

/**
 * PNG保存
 */

function exportPNG(){

    html2canvas(canvas).then(image=>{

        const link=

            document.createElement("a");

        link.download=

            "nijigaoka-map.png";

        link.href=

            image.toDataURL("image/png");

        link.click();

    });

}

btnPNG.addEventListener(

    "click",

    exportPNG

);

/* ===========================================================
【020】Zoom / Grid
=========================================================== */

function setZoom(value){

    App.zoom=

        clamp(

            value,

            0.25,

            3

        );

    canvas.style.transform=

        `scale(${App.zoom})`;

    updateZoomLabel();

}

btnZoomIn.addEventListener(

    "click",

    ()=>{

        setZoom(

            App.zoom+0.1

        );

    }

);

btnZoomOut.addEventListener(

    "click",

    ()=>{

        setZoom(

            App.zoom-0.1

        );

    }

);

btnGrid.addEventListener(

    "click",

    ()=>{

        App.gridVisible=

            !App.gridVisible;

        canvas.classList.toggle(

            "hide-grid",

            !App.gridVisible

        );

    }

);

/* ===========================================================
【021】Start
=========================================================== */

function initialize(){

    refresh();

    updateSaveStatus("新規");

    updateZoomLabel();

    showToast(

        "虹ケ丘学園 校内マップメーカー v1.0"

    );

}

initialize();
