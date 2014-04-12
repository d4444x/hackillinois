from flask import Flask, jsonify, render_template, send_from_directory, request, session, redirect, url_for
from firebase import firebase
import sendgrid
import lob
import APIconstants
import make_text
import hashlib
import time
import pyjade
app = Flask(__name__)


firebase = firebase.FirebaseApplication('https://rhtuts.firebaseio.com/', None)

@app.route('/')
@app.route('/index/')
def index():
    if not 'id' in  session:
        return redirect(url_for('login'))
    return render_template('index.jade')

@app.route('/answered/')
def getAnswered():
    if not 'id' in  session:
        return redirect(url_for('login'))
    return firebase.get('/users', session['id'])['answered']

@app.route('/payments/')
def payments():
    if not 'id' in  session:
        return redirect(url_for('login'))
    return render_template('payments.jade')

@app.route('/paid/')
def payed():
    if not 'id' in session:
        return redirect(url_for('login'))
    amount = 1.00*float(request.args['amount'])
    user = getUserDict(session['id'])
    firebase.put('/users', session['id'], {'username':user['username'], 'password':user['password'], 'email':user['email'], 'phone':user['phone'], 'credit':user['credit']+amount, 'answered':user['answered'], 'times':user['times']})
    return render_template('payment_successful.jade')

def levelComplete(section, level):
    answered = getAnswered()
    levels = firebase.get('/questions/sections/' + section + '/level/' + level, None)
    lvlCount = len(list(levels))
    userCount = 0
    for question in levels:
        if '/questions/sections/'+section+'/level/'+level+'/'+question in answered.split():
            userCount+=1
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

@app.route('/answer/', methods=['POST'])
def answer():
    if not 'id' in  session:
        return redirect(url_for('login'))
    jres = request.get_json()
    qid = jres['qid']
    answer = jres['answer']
    question = firebase.get(qid,None)
    if str(question['answer']) == str(answer):
        user = getUserDict(session['id'])
        if user['answered'].find(qid) == -1:
            if len(user['answered']) == 0:
                firebase.put('/users', session['id'], {'username':user['username'], 'password':user['password'], 'email':user['email'], 'phone':user['phone'], 'credit':user['credit']-float(qid[-1]), 'answered':qid, 'times':time.strftime("%m/%d/%Y %H:%M:%S")})
            else:
                firebase.put('/users', session['id'], {'username':user['username'], 'password':user['password'], 'email':user['email'], 'phone':user['phone'], 'credit':user['credit']-float(qid[-1]), 'answered':user['answered'] + ' ' + qid, 'times':user['times'] + '; ' + time.strftime("%m/%d/%Y %H:%M:%S")})
        if levelComplete(qid.split('/')[3], qid.split('/')[5]):
            if sectionComplete(qid.split('/')[3]):
                mailCert(user['username']) 
            else:
                make_text.text_person(user['phone'],'Your child has successfully completed '+ qid.split('/')[3]+ ' level '+ qid.split('/')[5])
                email(user['email'], qid.split('/')[3], qid.split('/')[5])
        else:
            print 'not complete'
        #iflevel, section?
        return jsonify({'correct':'true'})
    return jsonify({'correct':'false'})

@app.route('/ask/<section>/<level>/<number>')
def ask(section, level, number):
    if not 'id' in  session:
        return redirect(url_for('login'))
    question = firebase.get('/questions/sections/' + section + '/level/' + level + '/' + number, None)
    return jsonify(question)

@app.route('/ask/')
def sections():
    if not 'id' in  session:
        return redirect(url_for('login'))
    sections = firebase.get('/questions/sections', None)
    return jsonify({'sections':list(sections)})

@app.route('/ask/<section>')
def levels(section):
    if not 'id' in  session:
        return redirect(url_for('login'))
    levels = firebase.get('/questions/sections/' + section + '/level', None)
    return jsonify({section:list(levels)})

@app.route('/ask/<section>/<level>')
def questions(section, level):
    if not 'id' in  session:
        return redirect(url_for('login'))
    questions = firebase.get('/questions/sections/' + section + '/level/' + level, None)
    return jsonify({section:{level:list(questions)}})

@app.route('/credit/')
def credit():
    if not 'id' in session:
        return redirect(url_for('login'))
    return jsonify({'credit':firebase.get('/users', session['id'])['credit']})

def getUserDict(uid):
    return firebase.get('/users', uid)

@app.route('/login/')
def loginGet():
    return render_template('login.jade')

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

@app.route('/logout/')
def logout():
    session.pop('id',None)
    return redirect(url_for('index'))

@app.route('/register/', methods=['POST'])
def registerPost():
    username = request.form['username']
    password = hashlib.sha1(request.form['password']).hexdigest()
    email = request.form['email']
    phone = request.form['phone']
    if userExists(username):
        return redirect(url_for('index'))
    result = firebase.post('/users', {'username':username, 'password':password, 'email':email, 'phone':phone, 'credit':0, 'answered':'', 'times':''})
    session['id'] = result['name']
    return redirect(url_for('index'))

@app.route('/register/')
def register():
    return render_template('register.jade')

@app.route('/register/<username>/<password>')
def registerGet(username, password):
    username = username
    password = hashlib.sha1(password).hexdigest()
    if userExists(username):
        return redirect(url_for('index'))
    result = firebase.post('/users', {'username':username, 'password':password, 'email':'test@test.com', 'phone':'9999999999', 'credit':0, 'answered':'', 'times':''})
    session['id'] = result['name']
    return redirect(url_for('index'))

def userExists(user):
    users = firebase.get('/users',None)
    for uid in users:
        if users[uid]['username'] == user:
            return True
    return False

def email(email, section, level):
    sg = sendgrid.SendGridClient('DaxEarl', APIconstants.SENDGRIDPASS)
    message = sendgrid.Mail()
    message.add_to(email)
    message.set_subject('Your child has completed a level')
    message.set_html('Your child has completed the ' + section + ' section level ' + level + '<br>')
    message.set_from('toots4sloots<toots4loots@sendgrid.net>')
    status, msg = sg.send(message)
    print "sent "+email +" an email"

def mailCert(username):
    lob.api_key = APIconstants.LOBAPIKEY
    obj = [{'name' : 'Math Award', 'file' : 'www.golliver.me/suzy.pdf', 'setting_id' : '100', 'quantity' : 1}]
    from_address = {'name' : 'CEO OF MATH', 'address_line1' : '221 William T Morrissey', 'address_line2' : 'Sunset Town', 'address_city' : 'Boston', 'address_state' : 'MA', 'address_country' : 'US',           'address_zip' : '02125'}
    to_address = {'name' : 'Suzy', 'address_line1' : '220 William T Morrissey', 'address_line2' : 'Sunset Town', 'address_city' : 'Boston', 'address_state' : 'MA', 'address_country' : 'US',                    'address_zip' : '02125'}
    lobjobdict = lob.Job.create(name='Suzy Math Award', to=to_address, objects=obj, from_address=from_address, packaging_id='7').to_dict()
    print 'Certification Sent'

if __name__ == '__main__':
    app.jinja_env.add_extension('pyjade.ext.jinja.PyJadeExtension')
    app.debug = True
    app.port = 80
    app.secret_key = 'A0Zr98qqqqX R~Xzz!jmN]LWX/,?RT'
    app.run(host='0.0.0.0', port=80)
