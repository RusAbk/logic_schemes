'use strict';


const size = [1200, 500];

// Получаем и задаём размер для поля в котором будем рисовать SVG
let drawer = SVG().addTo('div#scheme').size(size[0], size[1]);

// let node1 = new OrNode(drawer);
// node1.move(150, 40);
// let node2 = new AndNode(drawer);
// node2.move(300, 200);

let elements = []

let linkMode = false;

document.querySelector('#btnAddInput').addEventListener('click', function(){
    let node = new Input(drawer);
    node.move(20, 0);
    elements.push(node);
})
document.querySelector('#btnAddAnd').addEventListener('click', function(){
    let node = new AndNode(drawer);
    node.move(20, 20);
    elements.push(node);
})
document.querySelector('#btnAddNand').addEventListener('click', function(){
    let node = new NandNode(drawer);
    node.move(20, 20);
    elements.push(node);
})
document.querySelector('#btnAddOr').addEventListener('click', function(){
    let node = new OrNode(drawer);
    node.move(20, 20);
    elements.push(node);
})
document.querySelector('#btnAddNor').addEventListener('click', function(){
    let node = new NorNode(drawer);
    node.move(20, 20);
    elements.push(node);
})
document.querySelector('#btnAddXor').addEventListener('click', function(){
    let node = new XorNode(drawer);
    node.move(20, 20);
    elements.push(node);
})
document.querySelector('#btnAddInv').addEventListener('click', function(){
    let node = new NotNode(drawer);
    node.move(20, 20);
    elements.push(node);
})

document.querySelector('#btnLinkMode').addEventListener('click', function(){
    document.querySelector('div#scheme svg').classList.toggle('linkMode');

})
document.querySelector('#btnRemoveLinkMode').addEventListener('click', function(){
    document.querySelector('div#scheme svg').classList.toggle('removeLinkMode');
    this.classList.toggle('btnSelected')
    
    if(sessionStorage.getItem('removeLinkMode') != 1){
        alert(`Для удаления соединения:\n1) Наведите на него курсор\n2) Убедитесь, что красным подсвечено именно нужное соединение\n3) Кликните на соединении для удаления`);
        sessionStorage.setItem('removeLinkMode', 1);
    }
})
document.querySelector('#btnRemoveElementMode').addEventListener('click', function(){
    document.querySelector('div#scheme svg').classList.toggle('removeElementMode');
    this.classList.toggle('btnSelected')
})

document.querySelector('#btnSave').addEventListener('click', function(e){
    var svg = document.querySelector('svg');
    var data = (new XMLSerializer()).serializeToString(svg);
    // We can just create a canvas element inline so you don't even need one on the DOM. Cool!
    var canvas = document.createElement('canvas');
    let v = canvg.Canvg.fromString(canvas.getContext('2d'), data);
    v.start();
    canvas.toBlob(function(blob) {
        download('my_logic_scheme.png', blob);
    });
})

function download(
    filename, // string
    blob // Blob
  ) {
    if (window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveBlob(blob, filename);
    } else {
      const elem = window.document.createElement('a');
      elem.href = window.URL.createObjectURL(blob);
      elem.download = filename;
      document.body.appendChild(elem);
      elem.click();
      document.body.removeChild(elem);
    }
  }


// let input = new Input(drawer, true, 50, 50);

// let not = new NotNode(drawer);

// let link = new Link(drawer, node1, node2, 1);
// let link2 = new Link(drawer, input, node1, 1);