from flask import Flask, render_template
import pyjade

app = Flask(__name__)

app.jinja_env.add_extension('pyjade.ext.jinja.PyJadeExtension')

@app.route('/')
def index():
    return render_template("index.jade")

app.run()
