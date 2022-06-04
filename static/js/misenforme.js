/* Place l'action d'ouvrir et fermer les développements d'arcticle. */
var section = document.getElementsByClassName('ouvrable');
for (var i = 0; i < section.length; i++) {
    var ouvre = section[i].getElementsByTagName('button')[0];
    var ferme = section[i].getElementsByTagName('button')[1];
    section[i].parentNode.insertBefore(ouvre,section[i]);
    /*bouton = ferme.cloneNode(true);
    section[i].appendChild(bouton);*/
    section[i].style.display='none';
    function clicOuvre() {
        this.nextSibling.style.display='block';
        this.style.display='none';
    };
    ouvre.addEventListener("click", clicOuvre);
    function clicFerme() {
        this.parentNode.style.display='none';
        this.parentNode.previousSibling.style.display='block';
    };
    ferme.addEventListener("click", clicFerme);
    /*bouton.addEventListener("click", clicFerme);*/
}
/* Place l'action de copie sur chaque morceau de code. */
var pre = document.getElementsByTagName('pre');
for (var i = 0; i < pre.length; i++) {
    var isLanguage = pre[i].children[0].className.indexOf('language-');
    if ( isLanguage === 0 ) {
        var button = document.createElement('button');
                button.className = 'copy-button';
                button.textContent = 'Copie';
                pre[i].appendChild(button);
    }
}
var copyCode = new ClipboardJS('.copy-button', {
    target: function(trigger) {
        return trigger.previousElementSibling;
    }
});
copyCode.on('success', function(event) {
    event.clearSelection();
    event.trigger.textContent = "C'est fait";
    window.setTimeout(function() {
        event.trigger.textContent = 'Copie';
    }, 2000);
});
copyCode.on('error', function(event) { 
    event.trigger.textContent = 'Impossible de copier';
    window.setTimeout(function() {
        event.trigger.textContent = 'Copie';
    }, 5000);
});