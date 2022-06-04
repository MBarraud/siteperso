var graphiquecanvas, zone, xmin, xunit, xmax, ymin, yunit, ymax;
var dessine = {"graphe" : t => {return null}};
function calibre(id, xmi, xma, ymi, yma, ySx) {
   zone = document.getElementById(id);
   xmin = xmi;
   xmax = xma;
   ymin = ymi;
   ymax = yma;
   graphiquecanvas = zone.getContext("2d");
   xunit = zone.width/(xmax-xmin);
   yunit = zone.height/(ymax-ymin);
   if (ySx*xunit>yunit) {
       var dx = ySx*zone.width/yunit - xmax + xmin;
       xmax = xmax + dx/2;
       xmin = xmin - dx/2;
       xunit = yunit/ySx;
   } else {
       var dy = zone.height/(ySx*xunit) - ymax + ymin;
       ymax = ymax + dy/2;
       ymin = ymin - dy/2;
       yunit = xunit*ySx;
   }
   return graphiquecanvas;
}
function xpx(x) {return (x-xmin)*xunit;}
function ypx(y) {return (ymax-y)*yunit;}
function positionne(divId,x,y) {
   var texte = document.getElementById(divId);
   texte.style.left = xpx(x)+"px";
   texte.style.top = ypx(y)+"px";
}
function axes() {
   var pasx = 1;
   var pasy = 1;
   if (arguments.length>0) {pasx = 1/arguments[0];}
   if (arguments.length>1) {pasy = 1/arguments[1];}
   graphiquecanvas.lineWidth="1";
   /* le quadrillage */
   graphiquecanvas.strokeStyle="#BBBBBB";
   graphiquecanvas.beginPath();
   for (var k = pasx; Math.floor(xmin) + k < xmax; k = k + pasx) {
       graphiquecanvas.moveTo(xpx(Math.floor(xmin) + k),ypx(ymin));
       graphiquecanvas.lineTo(xpx(Math.floor(xmin) + k),ypx(ymax));
   }
   for (var k = pasy; Math.floor(ymin) + k < ymax; k = k + pasy) {
       graphiquecanvas.moveTo(xpx(xmin),ypx(Math.floor(ymin) + k));
       graphiquecanvas.lineTo(xpx(xmax),ypx(Math.floor(ymin) + k));
   }
   graphiquecanvas.stroke();
   /* la graduation */
   graphiquecanvas.beginPath();
   graphiquecanvas.lineWidth="1";
   graphiquecanvas.strokeStyle="black";
   for (var k = pasx; Math.floor(xmin) + k < xmax; k = k + pasx) {
       graphiquecanvas.moveTo(xpx(Math.floor(xmin) + k),ypx(0)-3);
       graphiquecanvas.lineTo(xpx(Math.floor(xmin) + k),ypx(0)+3);
   }
   for (var k = pasy; Math.floor(ymin) + k < ymax; k = k + pasy) {
       graphiquecanvas.moveTo(xpx(0)-3,ypx(Math.floor(ymin) + k));
       graphiquecanvas.lineTo(xpx(0)+3,ypx(Math.floor(ymin) + k));
   }
   graphiquecanvas.stroke();
   /* l'axe des abscisses */
   graphiquecanvas.moveTo(xpx(xmin),ypx(0));
   graphiquecanvas.lineTo(xpx(xmax),ypx(0));
   graphiquecanvas.moveTo(xpx(xmax)-5,ypx(0)-3);
   graphiquecanvas.lineTo(xpx(xmax),ypx(0));
   graphiquecanvas.moveTo(xpx(xmax)-5,ypx(0)+3);
   graphiquecanvas.lineTo(xpx(xmax),ypx(0));
   /* l'axe des ordonnées */
   graphiquecanvas.moveTo(xpx(0),ypx(ymin));
   graphiquecanvas.lineTo(xpx(0),ypx(ymax));
   graphiquecanvas.lineTo(xpx(0)-3,ypx(ymax)+5);
   graphiquecanvas.lineTo(xpx(0),ypx(ymax));
   graphiquecanvas.lineTo(xpx(0)+3,ypx(ymax)+5);
   graphiquecanvas.lineTo(xpx(0),ypx(ymax));
   graphiquecanvas.stroke();
}
function trace(f,a,b,pas=0.05) {
   graphiquecanvas.beginPath();
   var x = a;
   graphiquecanvas.moveTo(xpx(x),ypx(f(x)));
   while(x<b) {
       graphiquecanvas.lineTo(xpx(x),ypx(f(x)));
       x=(x+pas);
   }
   graphiquecanvas.lineTo(xpx(b),ypx(f(b)));
   graphiquecanvas.stroke();
}
function segment(x1,y1,x2,y2) {
   graphiquecanvas.beginPath();
   graphiquecanvas.moveTo(xpx(x1),ypx(y1));
   graphiquecanvas.lineTo(xpx(x2),ypx(y2));
   graphiquecanvas.stroke();
}
function integrale(f,a,b) {
    var pas = 0.05;
    var hachure = false;
    var angle = 45 * Math.PI / 180;
    for (i=3;i<arguments.length;i++) {
        if (typeof arguments[i] === "string") {
            hachure = arguments[i].substr(0, 7) == "hachure";
            if (hachure) {
                var val = arguments[i].substr(7);
                if (val != "") {
                    angle = parseInt(val)* Math.PI / 180;
                }
            }
        }
        if (typeof arguments[i] === "number") {pas = arguments[i];}
    }
   graphiquecanvas.beginPath();
   var x = a;
   graphiquecanvas.moveTo(xpx(x),ypx(f(x)));
   while(x<b) {
       x=(x+pas);
       graphiquecanvas.lineTo(xpx(x),ypx(f(x)));
   }
   graphiquecanvas.lineTo(xpx(b),ypx(f(b)));
   graphiquecanvas.lineTo(xpx(b),ypx(0));
   graphiquecanvas.lineTo(xpx(a),ypx(0));
   graphiquecanvas.lineTo(xpx(a),ypx(f(a)));
   if (hachure==true) {
       var patternCanvas = document.createElement('canvas');
       patternCanvas.id=""+angle;
       patternCanvas.setAttribute('width', "320px");
       patternCanvas.setAttribute('height',"180px");
       var patternContext = patternCanvas.getContext('2d');
       patternContext.strokeStyle = graphiquecanvas.fillStyle;
       patternContext.lineWidth=2;
       if (angle>=0) {
           for (x = 0; x<=320; x = x+10/Math.sin(angle)) {
               patternContext.moveTo(x,180);
               patternContext.lineTo(x+650*Math.cos(angle),180-650*Math.sin(angle));
           }
           for (y = 180-10/Math.cos(angle); y>0; y = y-10/Math.cos(angle)) {
               patternContext.moveTo(0,y);
               patternContext.lineTo(650*Math.cos(angle),y-650*Math.sin(angle));
           }
       } else {
           angle = -angle;
           for (x = 0; x<=320; x = x+10/Math.sin(angle)) {
               patternContext.moveTo(x,0);
               patternContext.lineTo(x+650*Math.cos(angle),650*Math.sin(angle));
           }
           for (y = 10/Math.cos(angle); y<=180; y = y+10/Math.cos(angle)) {
               patternContext.moveTo(0,y);
               patternContext.lineTo(650*Math.cos(angle),y+650*Math.sin(angle));
           }
       }
       patternContext.stroke();
       var pattern = graphiquecanvas.createPattern(patternCanvas, 'no-repeat');
       graphiquecanvas.fillStyle = pattern;
       graphiquecanvas.fill();
       graphiquecanvas.fillStyle = patternContext.strokeStyle
   } else { graphiquecanvas.fill(); }
}
function ecrit(txt,x,y,couleur='#000000') {
   var texte = document.createElement('div');
   texte.innerHTML = txt;
   var parentDiv = zone.parentNode;
   parentDiv.insertBefore(texte, zone);
   texte.style.position='absolute';
   texte.style.zIndex='1';
   texte.style.color = couleur;
   texte.style.fontSize = "15px";
   texte.style.left = xpx(x)+"px";
   texte.style.top = ypx(y)+"px";
   /*texte.style.left = (xpx(x)-texte.offsetWidth/2)+"px";
   texte.style.top = (ypx(y)-texte.offsetHeight/2)+"px";*/
   return texte;
}
function norme(x,y) {
    return Math.sqrt(x*x+y*y);
}
function vecteur(x1,y1,x2,y2) {
   var px1 = xpx(x1);
   var px2 = xpx(x2);
   var py1 = ypx(y1);
   var py2 = ypx(y2);
   var nrm = norme(px2-px1,py2-py1);
   var bx1 = px2-3*(1.732*(px2-px1)-(py2-py1))/nrm;
   var by1 = py2-3*((px2-px1)+1.732*(py2-py1))/nrm;
   var bx2 = px2-3*(1.732*(px2-px1)+(py2-py1))/nrm;
   var by2 = py2-3*(-(px2-px1)+1.732*(py2-py1))/nrm;
   graphiquecanvas.beginPath();
   graphiquecanvas.moveTo(px1,py1);
   graphiquecanvas.lineTo(px2,py2);
   graphiquecanvas.lineTo(bx1,by1);
   graphiquecanvas.moveTo(px2,py2);
   graphiquecanvas.lineTo(bx2,by2);
   graphiquecanvas.stroke();
}
function joue(origine) {
    window.requestAnimationFrame = window.requestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.msRequestAnimationFrame;

    start = null;
    laps = 2000;
    requestAnimationFrame(anime);

    function anime(timestamp) {
        var progress;
        if (start === null) start = timestamp;
        progress = timestamp - start;
        if (progress < laps) {
            dessine[origine](progress);
            requestAnimationFrame(anime);
        }
    }
}
var zoom = 1;
var ux, uy, uz;
function calibre3D(id, xmi, xma, ymi, yma, zmi, zma) {
    graphiquecanvas = calibre(id, xmi+ymi*Math.cos(Math.PI/6)*0.7,
                                  xma+yma*Math.cos(Math.PI/6)*0.7,
                                  zmi+ymi*Math.sin(Math.PI/6)*0.7,
                                  zma+yma*Math.sin(Math.PI/6)*0.7, 1);
    ux = [xunit,0];
    uy = [xunit*Math.cos(Math.PI/6)*0.7,xunit*Math.sin(Math.PI/6)*0.7];
    uz = [0,yunit];
    return graphiquecanvas;
}
function point(px,py,pz) {
    if (arguments.length==2) {
        return [xpx(px),ypx(py)];
    }
    else {
        return [px*ux[0]+py*uy[0]+pz*uz[0]-xmin*xunit,ymax*yunit-(px*ux[1]+py*uy[1]+pz*uz[1])];
    }
}
function combinaison() {
    var x=0;
    var y=0;
    for (k=0;k<arguments.length;k=k+2) {
        x = x + arguments[k]*arguments[k+1][0];
        y = y + arguments[k]*arguments[k+1][1];
    }
    return [x,y];
}
function remplir() {
    graphiquecanvas.beginPath();
    graphiquecanvas.moveTo(arguments[0][0],arguments[0][1]);
    for (k=1;k<arguments.length;k=k+1) {
        graphiquecanvas.lineTo(arguments[k][0],arguments[k][1]);
    }
   graphiquecanvas.fill();
}
function ligne() {
    graphiquecanvas.beginPath();
    graphiquecanvas.moveTo(arguments[0][0],arguments[0][1]);
    for (k=1;k<arguments.length;k=k+1) {
        graphiquecanvas.lineTo(arguments[k][0],arguments[k][1]);
    }
   graphiquecanvas.stroke();
}
function angle(B,A,C,orient,z) {
    if (arguments.length<4) { orient = 1; }
    if (arguments.length<5) { z = 25; }
    graphiquecanvas.beginPath();
        var x = A[0]; // Coordonnée x
        var y = A[1]; // Coordonnée y
        var rayon = z; // Rayon de l'arc
        var angleInitial = -Math.acos((B[0]-A[0])/norme(B[0]-A[0],B[1]-A[1])); // Point de départ sur le cercle
        var angleFinal = -Math.acos((C[0]-A[0])/norme(C[0]-A[0],C[1]-A[1])); // Point d'arrivée sur le cercle
        if (B[1]>A[1]) {angleInitial = -angleInitial;}
        if (C[1]>A[1]) {angleFinal = -angleFinal;}
        graphiquecanvas.arc(x, y, rayon, angleInitial, angleFinal, orient);
   graphiquecanvas.stroke();
}
function fleche(p1,p2,z) {
   if (arguments.length==2) { z = 1; }
   var px1 = p1[0];
   var py1 = p1[1];
   var px2 = p2[0];
   var py2 = p2[1];
   var nrm = norme(px2-px1,py2-py1);
   var bx1 = px2-z*5*(1.732*(px2-px1)-(py2-py1))/nrm;
   var by1 = py2-z*5*((px2-px1)+1.732*(py2-py1))/nrm;
   var bx2 = px2-z*5*(1.732*(px2-px1)+(py2-py1))/nrm;
   var by2 = py2-z*5*(-(px2-px1)+1.732*(py2-py1))/nrm;
   graphiquecanvas.beginPath();
   graphiquecanvas.moveTo(px1,py1);
   graphiquecanvas.lineTo(px2,py2);
   graphiquecanvas.stroke();
   var temp = graphe.getLineDash();
   graphe.setLineDash([]);
   graphiquecanvas.beginPath();
   graphiquecanvas.moveTo(px2,py2);
   graphiquecanvas.lineTo(bx1,by1);
   graphiquecanvas.moveTo(px2,py2);
   graphiquecanvas.lineTo(bx2,by2);
   graphiquecanvas.stroke();
   graphe.setLineDash(temp);
}
function marque() {
   for (k=0;k<arguments.length;k=k+1) {
       graphiquecanvas.beginPath();
       graphiquecanvas.moveTo(arguments[k][0]-5,arguments[k][1]-5);
       graphiquecanvas.lineTo(arguments[k][0]+5,arguments[k][1]+5);
       graphiquecanvas.stroke();
       graphiquecanvas.beginPath();
       graphiquecanvas.moveTo(arguments[k][0]-5,arguments[k][1]+5);
       graphiquecanvas.lineTo(arguments[k][0]+5,arguments[k][1]-5);
       graphiquecanvas.stroke();
   }
}