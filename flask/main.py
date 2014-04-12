from flask import Flask, jsonify, render_template, send_from_directory, request, session, redirect, url_for
from firebase import firebase
import hashlib
import time
import pyjade
app = Flask(__name__)


firebase = firebase.FirebaseApplication('https://rhtuts.firebaseio.com/', None)

@app.route('/')
@app.route('/index/')
def index():
    return render_template('index.jade')

@app.route('/answered/')
def getAnswered():
    return firebase.get('/users', session['id'])['answered']

def levelComplete(section, level):
    answered = getAnswered()
    levels = firebase.get('/questions/sections/' + section + '/level/' + level, None)
    lvlCount = len(list(levels))
    userCount = answered.replace('/',' ').split(' ').count(level)
    if userCount == lvlCount:
        return True
    return False

def sectionComplete(section):
    answered = getAnswered()
    levels = firebase.get('/questions/sections/' + section + '/level', None)
    levels = list(levels)
    for level in levels:
        if not levelComplete(section, level):
            return False
    return True

@app.route('/answer/', methods=['GET','POST'])
def answer():
    qid = request.form['qid']
    answer = request.form['answer']
    question = firebase.get(qid,None)
    if answer == question['answer']:
        user = getUserDict(session['id'])
        if user['answered'].find(qid) == -1:
            if len(user['answered']) == 0:
                firebase.put('/users', session['id'], {'username':user['username'], 'password':user['password'], 'credit':user['credit'], 'answered':qid, 'times':time.strftime("%m/%d/%Y %I:%M:%S")})
            else:
                firebase.put('/users', session['id'], {'username':user['username'], 'password':user['password'], 'credit':user['credit'], 'answered':user['answered'] + ' ' + qid, 'times':user['times'] + '; ' + time.strftime("%m/%d/%Y %I:%M:%S")})
        if levelComplete(qid.split('/')[3], qid.split('/')[5]):
            if sectionComplete(qid.split('/')[3]):
                print "section complete"
            else:
                print "level complete"
        else:
            print 'not complete'
        #iflevel, section?
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
    result = firebase.post('/users', {'username':username, 'password':password, 'credit':0, 'answered':'', 'times':''})
    session['id'] = result['name']
    return redirect(url_for('index'))

@app.route('/register/<username>/<password>')
def registerGet(username, password):
    username = username
    password = hashlib.sha1(password).hexdigest()
    if userExists(username):
        return redirect(url_for('index'))
    result = firebase.post('/users', {'username':username, 'password':password, 'credit':0, 'answered':'', 'times':''})
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