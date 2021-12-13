'use strict';

let selectedNodes = [];
let appLinks = [];
let appInputs = [];

class Node{
    constructor(drawer, input = null){
        this.input = input;
        this.inputsCount = 1;
        this.type = 'unaryNode';

        this.x = 0;
        this.y = 0;

        this.fill = '#fff';
        this.stroke = '#000';
        this.activeColor = '#55efc4';

        this.w = 20;
        this.h = 50;

        this.shape = {};
        this.drawer = drawer;
        this.draw();

        this.dragMode = false;
        this.dragOffset = [0, 0];
    }

    operate(){
        return this.input.operate();
    }
    draw(){
        this.basicDraw()
    }
    basicDraw(){
        let lineStyle = { color: this.stroke, width: 2, linecap: 'butt', linejoin: 'butt' };
        
        this.shape.base = this.drawer.rect(this.w, this.h).attr({ fill: this.fill, stroke: this.stroke });
        this.shape.base.addClass('base')
        
        this.shape.input = this.drawer.polyline(`0,0 ${this.h / 5 * -1},0`);
        this.shape.input.stroke(lineStyle);
        this.shape.input.transform({translateX: this.h / 5 * -1, translateY: this.h / 2})
        
        this.shape.output = this.drawer.polyline(`0,0 ${this.h / 5 * -1},0`);
        this.shape.output.stroke(lineStyle)
        this.shape.output.transform({translateX: this.w, translateY: this.h / 2})

        for(let el in this.shape){
            this.shape[el].move(this.x, this.y);
        }

        this.shape.base.node.addEventListener('mousedown', (e)=>{
            let rect = e.currentTarget.getBoundingClientRect();
            let parentRect = e.currentTarget.parentElement.getBoundingClientRect()
            // console.log(rect);

            this.dragMode = true;
            this.dragOffset = [e.clientX - rect.x + parentRect.x, e.clientY - rect.y + parentRect.y];
            // e.currentTarget.requestPointerLock()
        })
        this.shape.base.node.addEventListener('mouseup', (e)=>{
            this.dragMode = false;
            e.currentTarget.dispatchEvent(new CustomEvent("dragged"));
        })
        this.shape.base.node.addEventListener('click', (e)=>{
            if(e.currentTarget.parentElement.classList.contains('linkMode')){
                if(selectedNodes.indexOf(this) == -1){
                    selectedNodes.push(this)
                    this.shape.base.addClass('selectedElement')
                } else {
                    selectedNodes.splice(selectedNodes.indexOf(this), 1)
                    this.shape.base.removeClass('selectedElement')
                }
                if(selectedNodes.length > 1){
                    for(let node of selectedNodes){
                        node.shape.base.removeClass('selectedElement')
                    }

                    let input = 0;
                    if(this.type == 'binaryNode'){
                        input = prompt('С каким входом элемента вы хотите создать соединение?\n\n(1 - верхний; 2 - нижний)')
                        while(input != 1 && input != 2){
                            input = prompt('Ошибочное значение! \n\nС каким входом элемента вы хотите создать соединение?\n\n(1 - верхний; 2 - нижний)')
                        }
                    }
                    let link = new Link(drawer, selectedNodes[0], selectedNodes[1], this.type == 'binaryNode' ? input : 1);
                    appLinks.push(link);
                    selectedNodes = []
                    e.currentTarget.parentElement.classList.remove('linkMode');
                }
            }
            if(e.currentTarget.parentElement.classList.contains('removeElementMode')){
                for(let part in this.shape){
                    this.shape[part].remove();
                }
                for(let i = 0; i < appLinks.length; i++){
                    if(appLinks[i].node1 == this || appLinks[i].node2 == this){
                        appLinks[i].line.remove();
                        appLinks.splice(i, 1);
                        i--;
                    }
                }
            }
        })
        this.shape.base.node.addEventListener('mousemove', (e)=>{
            if(this.dragMode){
                this.move(e.clientX - this.dragOffset[0], e.clientY - this.dragOffset[1])
                e.currentTarget.dispatchEvent(new CustomEvent("dragged"));
            }
        })

        return this;
    }
    move(x, y){
        this.x = x;
        this.y = y;
        for(let el in this.shape){
            this.shape[el].move(this.x, this.y);
        }
        return this;
    }
}

class Input extends Node{
    constructor(drawer, val = false, x = 0){
        super(drawer, false);
        this.readyToDraw = false;
        this.val = val;
        this.type = 'input';

        this.x = x;
        this.width = 6;

        this.trueColor = '#2ecc71';
        this.falseColor = '#666';
        this.stroke = '#000';

        this.readyToDraw = true;
        appInputs.push(this);
        this.draw();
    }
    operate(){
        return this.val;
    }
    toggle(){
        this.val = !this.val;
    }
    setVal(val){
        this.val = val;
    }

    draw(){
        if(this.readyToDraw){
            this.shape.base = this.drawer.line(`${this.x},0 ${this.x},500`).stroke({ width: this.width });
            this.shape.base.addClass('base')
            this.shape.base.move(this.x, 0);
             // this.shape.output = this.drawer.circle(`0,0 1,0`);

             this.shape.textBg = this.drawer.rect(20, 20).fill('#fff').move(0, 0).transform({translateX: -10, translateY: 0})
             this.shape.text = this.drawer.text(`x${appInputs.length}`).move(0, 0);
             this.shape.text.font({
                 family: 'Arial', size: 14, anchor: 'top', leading: '1'
               })
             this.shape.text.transform({translateX: -4, translateY: 0})
    
            this.shape.base.node.addEventListener('click', (e)=>{
                if(e.currentTarget.parentElement.classList.contains('linkMode')){
                    if(selectedNodes.length == 0 && selectedNodes.indexOf(this) == -1){
                        selectedNodes.push(this)
                        this.shape.base.addClass('selectedElement')
                    } else if(selectedNodes.indexOf(this) != -1) {
                        selectedNodes.splice(selectedNodes.indexOf(this), 1)
                        this.shape.base.removeClass('selectedElement')
                    }
                } else if(e.currentTarget.parentElement.classList.contains('removeElementMode')){
                    for(let part in this.shape){
                        this.shape[part].remove();
                    }
                    for(let i = 0; i < appLinks.length; i++){
                        if(appLinks[i].node1 == this || appLinks[i].node2 == this){
                            appLinks[i].line.remove();
                            appLinks.splice(i, 1);
                            i--;
                        }
                    }
                } else {
                    this.toggle();
                }
                this.updateView();
            })
            this.shape.base.node.addEventListener('mousedown', (e)=>{
                let rect = e.currentTarget.getBoundingClientRect();
                let parentRect = e.currentTarget.parentElement.getBoundingClientRect()
    
                this.dragMode = true;
                this.dragOffset = [e.clientX - rect.x + parentRect.x, e.clientY - rect.y + parentRect.y];
            })
            this.shape.base.node.addEventListener('mouseup', (e)=>{
                this.dragMode = false;
                e.currentTarget.dispatchEvent(new CustomEvent("dragged"));
            })
            this.shape.base.node.addEventListener('mousemove', (e)=>{
                if(this.dragMode){
                    this.move(e.clientX - this.dragOffset[0], 0)
                    e.currentTarget.dispatchEvent(new CustomEvent("dragged"));
                }
            })

            this.updateView();
        }
    }
    updateView(){
        console.log(this.shape.base)
        this.shape.base.stroke({color: this.val ? this.trueColor : this.falseColor, width: this.width});
        this.shape.base.move(this.x, 0);
    }
}

class InvNode extends Node{
    constructor(drawer, input = null){
        super(drawer, input);
    }
    operate(){
        return !(this.input.operate());
    }
    basicInvDraw(){
        this.basicDraw();
        let d = this.w/3

        this.shape.invOut = this.drawer.circle(d).attr({fill: this.fill, stroke: this.stroke});
        this.shape.invOut.transform({translateX: this.w - d/2, translateY: this.h/2 - d/2})
    }
}

class BinNode extends Node{
    constructor(drawer, input1 = null, input2 = null){
        super(drawer, input1);
        this.input2 = input2;
        this.inputsCount = 2;
        this.type = 'binaryNode';
    }
    operate(){
        return this.input.operate() && this.input2.operate();
    }
    draw(){
        this.basicBinDraw();
    }
    basicBinDraw(){
        this.basicDraw();

        this.shape.input.transform({translateX: this.h / 5 * -1, translateY: this.h / 2 - this.h / 5})

        this.shape.input2 = this.drawer.polyline(`0,0 ${this.h / 5 * -1},0`);
        this.shape.input2.stroke({ color: this.stroke, width: 2, linecap: 'butt', linejoin: 'butt' });
        this.shape.input2.transform({translateX: this.h / 5 * -1, translateY: this.h / 2 + this.h / 5})
    }
}

class BinInvNode extends BinNode{
    constructor(drawer, input1 = null, input2 = null){
        super(drawer, input1, input2);
    }
    basicBinInvDraw(){
        this.basicBinDraw();
        let d = this.w/3

        this.shape.invOut = this.drawer.circle(d).attr({fill: this.fill, stroke: this.stroke});
        this.shape.invOut.transform({translateX: this.w - d/2, translateY: this.h/2 - d/2})
        // console.log(this.shape)
    }
}

class NotNode extends InvNode{
    constructor(drawer, input = null){
        super(drawer, input);
    }
    operate(){
        return !this.input.operate();
    }
    draw(){
        this.basicInvDraw();
    }
}

class AndNode extends BinNode{
    constructor(drawer, input1 = null, input2 = null){
        super(drawer, input1, input2);
    }
    operate(){
        return this.input.operate() && this.input2.operate();
    }
    draw(){
        this.basicBinDraw();

        this.shape.text = this.drawer.text("&").move(0, 10);
        this.shape.text.font({
            family: 'Arial', size: this.w/1.7, anchor: 'top', leading: '1'
          })
        this.shape.text.transform({translateX: this.w/3, translateY: this.h/2.5})
        this.shape.text.addClass('unselectable')
    }
}

class NandNode extends BinInvNode{
    constructor(drawer, input1 = null, input2 = null){
        super(drawer, input1, input2);
    }
    operate(){
        return ! this.input.operate() && this.input2.operate();
    }
    draw(){
        this.basicBinInvDraw();

        this.shape.text = this.drawer.text("&").move(0, 10);
        this.shape.text.font({
            family: 'Arial', size: this.w/1.7, anchor: 'top', leading: '1'
          })
        this.shape.text.transform({translateX: this.w/3, translateY: this.h/2.5})
        this.shape.text.addClass('unselectable')
    }
}

class NorNode extends BinInvNode{
    constructor(drawer, input1 = null, input2 = null){
        super(drawer, input1, input2);
    }
    operate(){
        return ! this.input.operate() || this.input2.operate();;
    }
    draw(){
        this.basicBinInvDraw();

        this.shape.text = this.drawer.text("1").move(0, 10);
        this.shape.text.font({
            family: 'Arial', size: this.w/1.7, anchor: 'top', leading: '1'
          })
        this.shape.text.transform({translateX: this.w/3, translateY: this.h/2.5})
        this.shape.text.addClass('unselectable')
    }
}

class OrNode extends BinNode{
    constructor(drawer, input1 = null, input2 = null){
        super(drawer, input1, input2);
    }
    operate(){
        return this.input.operate() || this.input2.operate();
    }
    draw(){
        this.basicBinDraw();

        this.shape.text = this.drawer.text("1").move(0, 10);
        this.shape.text.font({
            family: 'Arial', size: this.w/1.7, anchor: 'top', leading: '1'
          })
        this.shape.text.transform({translateX: this.w/3, translateY: this.h/2.5})
    }
}

class XorNode extends BinNode{
    constructor(drawer, input1 = null, input2 = null){
        super(drawer, input1, input2);
    }
    operate(){
        return this.input.operate() ^ this.input2.operate();
    }
    draw(){
        this.basicBinDraw();

        this.shape.text = this.drawer.text("=1").move(0, 10);
        this.shape.text.font({
            family: 'Arial', size: this.w/1.7, anchor: 'top', leading: '1'
          })
        this.shape.text.transform({translateX: this.w/4, translateY: this.h/2.5})
    }
}

class Link{
    constructor(drawer, node1 = null, node2 = null, inputN = 1){
        this.drawer = drawer;

        this.node1 = node1;
        this.node2 = node2;
        this.inputN = inputN;

        this.shape = {};
        this.draw();
    }
    calcPos1(){
        let pos = {x: 0, y: 0};
        if(this.node1.type == 'binaryNode' || this.node1.type == 'unaryNode'){
            pos.x = this.node1.x + this.node1.w + this.node1.h/5;
            pos.y = this.node1.y + this.node1.h/2;
        } else if(this.node1.type == 'input') {
            pos.x = this.node1.x;
            if(this.node2.type == 'unaryNode'){
                pos.y = this.node2.y + this.node2.h/2;
            } else {
                if(this.inputN == 1)
                    pos.y = this.node2.y + this.node2.h/2 - this.node2.h/5;
                else
                    pos.y = this.node2.y + this.node2.h/2 + this.node2.h/5;
            }
        }

        return pos;
    }
    calcPos2(){
        let pos = {x: 0, y: 0};
        if(this.node2.type == 'binaryNode'){
            pos.x = this.node2.x - this.node2.h/5;
            pos.y = this.inputN == 1 ? this.node2.y + this.node2.h/2 - this.node2.h/5 : this.node2.y + this.node2.h/2 + this.node2.h/5;
        } else if(this.node2.type == 'unaryNode') {
            pos.x = this.node2.x - this.node2.h/5;
            pos.y = this.node2.y + this.node2.h/2;
        }

        return pos;
    }
    draw(){
        let x1 = this.calcPos1().x;
        let y1 = this.calcPos1().y;

        let x2 = this.calcPos2().x
        let y2 = this.calcPos2().y

        this.shape.line = drawer.polyline(`${x1},${y1} ${x1 + (x2 - x1)/2},${y1} ${x1 + (x2 - x1)/2},${y2} ${x2},${y2}`).fill('none');
        this.shape.line.stroke({ color: '#000', width: 1, linecap: 'butt', linejoin: 'butt', width: 2 });
        this.shape.line.addClass('link')
        if(this.node1.type == 'input'){
            this.shape.dot = this.drawer.circle(12).fill('#000').move(x1 - 6, y1 - 6);
        }

        this.shape.line.on('click', function(e){
            console.log(e.currentTarget.parentElement.classList.contains('removeLinkMode'));
            if(e.currentTarget.parentElement.classList.contains('removeLinkMode')){
                this.remove();
                appLinks.splice(appLinks.indexOf(this), 1);
            }
        })

        this.node1.shape.base.node.addEventListener('dragged', (e)=>{
            this.update();
        })
        this.node2.shape.base.node.addEventListener('dragged', (e)=>{
            this.update();
        })
    }
    update(){
        let x1 = this.calcPos1().x;
        let x2 = this.calcPos2().x
        let y1 = this.calcPos1().y;
        let y2 = this.calcPos2().y
        this.shape.line.plot(`${x1},${y1} ${x1 + (x2 - x1)/2},${y1} ${x1 + (x2 - x1)/2},${y2} ${x2},${y2}`)
        this.shape.dot.move(x1 - 6, y1 - 6);
    }
}
