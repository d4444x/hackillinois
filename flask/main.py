from flask import Flask, render_template, send_from_directory, request, session, redirect, url_for
from firebase import firebase
import hashlib
import pyjade
app = Flask(__name__)


firebase = firebase.FirebaseApplication('https://rhtuts.firebaseio.com/', None)

@app.route('/')
@app.route('/index/')
def index():
    return render_template('index.jade')

@app.route('/register/', methods=['POST'])
def registerPost():
    username = request.form['username']
    password = hashlib.sha1(request.form['password']).hexdigest()
    result = firebase.post('/users', {'username':username, 'password':password})
    return redirect(url_for('index'))

@app.route('/register/<username>/<password>')
def registerGet(username, password):
    username = username
    password = hashlib.sha1(password).hexdigest()
    result = firebase.post('/users', {'username':username, 'password':password})
    return redirect(url_for('index'))
    

if __name__ == '__main__':
    app.jinja_env.add_extension('pyjade.ext.jinja.PyJadeExtension')
    app.debug = True
    app.port = 80
    app.run(host='0.0.0.0', port=5000)
