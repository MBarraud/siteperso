import os
from flask import Flask, render_template, Markup, request
import MySQLdb

app = Flask(__name__)
my_dir = os.path.dirname(__file__)

def getMatieres():
    db = MySQLdb.connect(host='Barraud.mysql.pythonanywhere-services.com',user='Barraud',passwd='EKLbase27',db='Barraud$enseignement')
    db.query("""SELECT * FROM matiere;""")
    r = db.store_result()
    matiere = []
    mat = r.fetch_row()
    while mat != tuple() :
        matiere.append(mat[0])
        mat = r.fetch_row()
    db.close()
    return matiere

def getNiveaux(id_matiere):
    db = MySQLdb.connect(host='Barraud.mysql.pythonanywhere-services.com',user='Barraud',passwd='EKLbase27',db='Barraud$enseignement')
    db.query("""SELECT id_niveau, nom_niveau FROM cours NATURAL JOIN niveau WHERE id_matiere={};""".format(id_matiere))
    r = db.store_result()
    niveau = {}
    niv = r.fetch_row()
    while niv != tuple() :
        if niv[0][0] in niveau:
            niveau[niv[0][0]][1] = niveau[niv[0][0]][1] + 1
        else :
            niveau[niv[0][0]] = [niv[0][1],1]
        niv = r.fetch_row()
    db.close()
    niveau = [[n,niveau[n][0],niveau[n][1]] for n in niveau]
    niveau.sort()
    return niveau

def getCours(id_matiere, id_niveau):
    db = MySQLdb.connect(host='Barraud.mysql.pythonanywhere-services.com',user='Barraud',passwd='EKLbase27',db='Barraud$enseignement')
    db.query("""SELECT id_cours, titre_cours FROM cours NATURAL JOIN niveau NATURAL JOIN matiere WHERE id_matiere={} AND id_niveau={};""".format(id_matiere,id_niveau))
    r = db.store_result()
    cours = []
    cou = r.fetch_row()
    while cou != tuple() :
        cours.append([cou[0][0],cou[0][1]])
        cou = r.fetch_row()
    db.close()
    return sorted(cours, key=lambda x:x[1])

@app.route('/')
def index():
    matiere = getMatieres()
    return render_template('index.html', matiere=matiere )

@app.route('/index/<int:id_matiere>')
def index_mat(id_matiere):
    matiere = getMatieres()
    nom_matiere = "???"
    for mat in matiere:
        if mat[0]==id_matiere:
            nom_matiere = mat[1]
    niveau = getNiveaux(id_matiere)
    if id_matiere == 2:
        return index_cours(2,2)
    else :
        return render_template('index.html', matiere=matiere, niveau=niveau, id_matiere=id_matiere, nom_matiere=nom_matiere)

@app.route('/index/<int:id_matiere>/<int:id_niveau>')
def index_cours(id_matiere,id_niveau):
    matiere = getMatieres()
    nom_matiere = "???"
    for mat in matiere:
        if mat[0]==id_matiere:
            nom_matiere = mat[1]
    niveau = getNiveaux(id_matiere)
    nom_niveau = "???"
    for niv in niveau:
        if niv[0]==id_niveau:
            nom_niveau = niv[1]
    cours = getCours(id_matiere, id_niveau)
    return render_template('index.html', matiere=matiere, niveau=niveau, cours = cours, id_niveau=id_niveau, nom_niveau=nom_niveau, id_matiere=id_matiere, nom_matiere=nom_matiere)

@app.route('/cours/<int:id_cours>')
def etapes_cours(id_cours):

    db = MySQLdb.connect(host='Barraud.mysql.pythonanywhere-services.com',user='Barraud',passwd='EKLbase27',db='Barraud$enseignement')

    # Titre du cours
    db.query("""SELECT titre_cours, id_matiere, id_niveau FROM cours WHERE id_cours = {};""".format(id_cours))
    r = db.store_result()
    ids = r.fetch_row()
    if ids == tuple:
        id_cours = -1
        id_matiere = None
        id_niveau = None
        titre_cours = "Cours non trouvé"
    else :
        titre_cours = ids[0][0]
        id_matiere = ids[0][1]
        id_niveau = ids[0][2]

    # Prérequis au cours
    db.query("""SELECT id_cours_requis, titre_cours FROM requiert R JOIN cours C ON R.id_cours_requis = C.id_cours WHERE R.id_cours = {};""".format(id_cours))
    r = db.store_result()
    prerequis = []
    requis = r.fetch_row()
    while requis != tuple() :
        prerequis.append([requis[0][0],requis[0][1]])
        requis = r.fetch_row()

    # Cours suivants possibles
    db.query("""SELECT id_cours, titre_cours FROM requiert R NATURAL JOIN cours C WHERE R.id_cours_requis = {};""".format(id_cours))
    c = db.store_result()
    corollaire = []
    coro = c.fetch_row()
    while coro != tuple() :
        corollaire.append([coro[0][0],coro[0][1]])
        coro = c.fetch_row()

    # étapes
    db.query("""SELECT * FROM etape WHERE id_cours = {};""".format(id_cours))
    c = db.store_result()
    etape = []
    eta = c.fetch_row()
    while eta != tuple() :
        etape.append((eta[0][1],eta[0][0],eta[0][4]))
        eta = c.fetch_row()
    etape.sort()

    #rendu
    db.close()

    matiere = getMatieres()
    nom_matiere = "???"
    for mat in matiere:
        if mat[0]==id_matiere:
            nom_matiere = mat[1]
    niveau = getNiveaux(id_matiere)
    nom_niveau = "???"
    for niv in niveau:
        if niv[0]==id_niveau:
            nom_niveau = niv[1]
    return render_template('index.html', etape=etape, matiere=matiere, niveau=niveau, id_niveau=id_niveau, nom_niveau=nom_niveau, id_matiere=id_matiere, nom_matiere=nom_matiere, id_cours=id_cours, titre_cours=titre_cours, prerequis=prerequis, corollaire=corollaire)

@app.route('/app/<string:app>')
def app_tri(app):
    html = ""
    with open(my_dir+'/static/app-'+app+'/'+app+'.html', encoding='utf8') as file:
                html = file.read()
    return render_template('app.html', app = app, html = Markup(html))

@app.route('/cours/<int:id_cours>/<int:num_etape>')
def cours(id_cours, num_etape):

    db = MySQLdb.connect(host='Barraud.mysql.pythonanywhere-services.com',user='Barraud',passwd='EKLbase27',db='Barraud$enseignement')

    # Titre du cours
    db.query("""SELECT titre_cours, id_matiere, id_niveau FROM cours WHERE id_cours = {};""".format(id_cours))
    r = db.store_result()
    ids = r.fetch_row()
    if ids == tuple:
        id_cours = -1
        id_matiere = None
        id_niveau = None
        titre_cours = "Cours non trouvé"
    else :
        titre_cours = ids[0][0]
        id_matiere = ids[0][1]
        id_niveau = ids[0][2]

    # Prérequis au cours
    db.query("""SELECT id_cours_requis, titre_cours FROM requiert R JOIN cours C ON R.id_cours_requis = C.id_cours WHERE R.id_cours = {};""".format(id_cours))
    r = db.store_result()
    prerequis = []
    requis = r.fetch_row()
    while requis != tuple() :
        prerequis.append([requis[0][0],requis[0][1]])
        requis = r.fetch_row()

    # Cours suivants possibles
    db.query("""SELECT id_cours, titre_cours FROM requiert R NATURAL JOIN cours C WHERE R.id_cours_requis = {};""".format(id_cours))
    c = db.store_result()
    corollaire = []
    coro = c.fetch_row()
    while coro != tuple() :
        corollaire.append([coro[0][0],coro[0][1]])
        coro = c.fetch_row()

    # étapes
    db.query("""SELECT * FROM etape WHERE id_cours = {};""".format(id_cours))
    c = db.store_result()
    etape = {'avant' : None, 'titre' : None, 'après' : None}
    html = "Cours non disponible"
    cou = c.fetch_row()
    while cou != tuple() :
        if cou[0][1] == num_etape-1:
            etape['avant']=cou[0][4]
        if cou[0][1] == num_etape:
            etape['titre']=cou[0][4]
            with open(my_dir+'/static/etape/'+cou[0][3]+'.html', encoding='utf8') as file:
                html = file.read()
        if cou[0][1] == num_etape+1:
            etape['après']=cou[0][4]
        cou = c.fetch_row()

    db.close()

    matiere = getMatieres()
    nom_matiere = "???"
    for mat in matiere:
        if mat[0]==id_matiere:
            nom_matiere = mat[1]
    niveau = getNiveaux(id_matiere)
    nom_niveau = "???"
    for niv in niveau:
        if niv[0]==id_niveau:
            nom_niveau = niv[1]
    return render_template('cours.html', etape = etape, matiere=matiere, niveau=niveau, id_niveau=id_niveau, nom_niveau=nom_niveau, id_matiere=id_matiere, nom_matiere=nom_matiere, id_cours = id_cours, titre_cours=titre_cours, prerequis=prerequis, corollaire = corollaire, num_etape=num_etape, html = Markup(html))

@app.route('/login',methods = ['POST', 'GET'])
def login():
    code = {'DURANTON' : 'Détraqueur',
            'GOMES' : 'Grapcorne',
            'HOLLET' : 'Hippogriffe',
            'LARDY' : 'Niffleur',
            'MAHIEU' : 'Manticore',
            'PINEAU' : 'Pitiponk',
            'RATHOUIT' : 'Strangulot',
            'ROUANET' : 'Sombral',
            'SARDOU' : 'Sinistros',
            'SERRES' : 'Serpencendre',
            'TEXIER' : 'Veracrasse'}

    if request.method == 'POST':
        user = request.form.get('nom','')
        mdp = request.form.get('mdp','')
        if user.upper() not in code.keys():
            return "<p>Vous êtes à la bonne adresse mais votre nom n'est pas reconnu !</p><p>Les valeurs possibles sont celles de la liste :</p><p>"+str(code.keys())+"</p>"
        if mdp != code[user.upper()]:
            return "<p>Ce n'est pas le bon mot de passe pour "+user+"</p>"
        return 'Contrôle terminé. Envoyer votre page web sur pronote'
    else:
        user = request.args.get('nom','')
        if user.upper() not in code.keys():
            return "<p>Vous êtes à la bonne adresse mais votre nom n'est pas reconnu !</p><p>Les valeurs possibles sont celles de la liste :</p><p>"+str(code.keys())+"</p>"
        return render_template('ds.html',animal = code[user.upper()])

if __name__ == '__main__':
    app.run(host='localhost',port='5000')#ssl_context='adhoc'