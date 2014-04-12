from flask import Flask, jsonify, render_template, send_from_directory, request, session, redirect, url_for
from firebase import firebase
import hashlib
import pyjade
app = Flask(__name__)


firebase = firebase.FirebaseApplication('https://rhtuts.firebaseio.com/', None)

@app.route('/')
@app.route('/index/')
def index():
    return render_template('index.jade')

@app.route('/answer/', methods=['GET','POST'])
def answer():
    qid = request.form['qid']
    answer = request.form['answer']
    question = firebase.get(qid,None)
    if answer == question['answer']:
        user = getUserDict(session['id'])
        if len(user['answered']) == 0:
            firebase.put('/users', session['id'], {'username':user['username'], 'password':user['password'], 'credit':user['credit'], 'answered':qid})
        else:
            firebase.put('/users', session['id'], {'username':user['username'], 'password':user['password'], 'credit':user['credit'], 'answered':user['answered'] + ', ' + qid})
        return jsonify({'correct':'true'})
    return jsonify({'correct':'false'})

@app.route('/ask/<section>/<level>/<number>')
def ask(section, level, number):
    question = firebase.get('/questions/sections/' + section + '/level/' + level + '/' + number, None)
    return jsonify(question)

@app.route('/ask/')
def sections():
    sections = firebase.get('/questions/sections', None)
    return jsonify({'sections':list(sections)})

@app.route('/ask/<section>')
def levels(section):
    levels = firebase.get('/questions/sections/' + section + '/level', None)
    return jsonify({'levels':list(levels)})

@app.route('/ask/<section>/<level>')
def questions(section, level):
    questions = firebase.get('/questions/sections/' + section + '/level/' + level, None)
    return jsonify({'questions':list(questions)})

def getUserDict(uid):
    return firebase.get('/users', uid)

@app.route('/login/', methods=['POST'])
def login():
    username = request.form['username']
    password = hashlib.sha1(request.form['password']).hexdigest()
    users = firebase.get('/users',None)
    for uid in users:
        user = users[uid]
        if user['username'] == username and user['password'] == password:
            session['id'] = uid
    return redirect(url_for('index'))

@app.route('/register/', methods=['POST'])
def registerPost():
    username = request.form['username']
    password = hashlib.sha1(request.form['password']).hexdigest()
    if userExists(username):
        return redirect(url_for('index'))
    result = firebase.post('/users', {'username':username, 'password':password, 'credit':0, 'answered':''})
    session['id'] = result['name']
    return redirect(url_for('index'))

@app.route('/register/<username>/<password>')
def registerGet(username, password):
    username = username
    password = hashlib.sha1(password).hexdigest()
    if userExists(username):
        return redirect(url_for('index'))
    result = firebase.post('/users', {'username':username, 'password':password, 'credit':0, 'answered':''})
    session['id'] = result['name']
    return redirect(url_for('index'))

def userExists(user):
    users = firebase.get('/users',None)
    for uid in users:
        if users[uid]['username'] == user:
            return True
    return False

if __name__ == '__main__':
    app.jinja_env.add_extension('pyjade.ext.jinja.PyJadeExtension')
    app.debug = True
    app.port = 80
    app.secret_key = 'A0Zr98qqqqX R~Xzz!jmN]LWX/,?RT'
    app.run(host='0.0.0.0', port=80)
