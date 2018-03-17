import flask

from zenbrewism import app
import zenbrewism.models as models

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
    return response

@app.route('/')
def index():
    return 'Hello World!'

@app.route('/test')
def test():
    return 'Hello from test!'

@app.route('/page/home')
def home():

    pages = models.PageCollection(stage='dev')
    print(pages.prefix)
    print(pages.bucket)
    print(pages.index)
    page_dict = pages.load('home', default='')
    return flask.json.jsonify({'text': page_dict['content']})

@app.errorhandler(404)
def page_not_found(e):
    #snip
    return "got the 404", 404
