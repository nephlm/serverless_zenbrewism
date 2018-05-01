

import React from 'react';
import ReactDOM from 'react-dom';
import Modal from 'react-modal';
import axios from 'axios';

import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom'


import './index.css';

import { Content } from './body.js';

var textile = require('textile-js');


class SiteRoute extends React.Component {
  render() {
    return (
      <div>
        <Route exact path='/' Component={Page}/>
        <Route exact path='/home' Component={Page}/>
      </div>
    );
  }
}


class Page extends React.Component {
  render() {
    return (
      <div className="page">
      	<Header/>
        <div className="main">
        	<RightCol/>
        	<Content/>
        </div>
      </div>
    );
  }
}


class Header extends React.Component {
  render() {
    return (
	  <div className="header">
	  	<img className="icon" src="/static/img/yinyang_300.png" width="30" height="30" />
	    <h1 className="title">Todd Kaye</h1>
	    <h1 className="subtitle">Zen Brewism Books</h1>
	  </div>    	
    );
  }
}


class RightCol extends React.Component {
  render() {
    return (
      <div className="outer-right">
        <Mailinglist />
        <hr width="75%"/>
        <h4 className="aboutme">About Me</h4>
        <img className="photo" src="/static/img/portrait.jpg" />
        <p className="aboutme-text">  
        	Todd feels uncomfortable writing about himself in the third 
        	person, but apparently that's the way these are supposed to be done.
        	He's been telling stories for 20 years and it felt like time to 
        	write some down.
        </p>
        <p className="aboutme-text">
        	When not telling stories Todd is a software engineer by trade.  He's 
        	built systems to protect the Department of Defense from cyberattacks
        	back when that was a new fangled word and is currently protecting your
        	phone from SMS Spam.
        </p>
      </div>
    );
  }
}

const customStyles = {
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)'
  }
};

class Mailinglist extends React.Component {
  constructor() {
    super();

    this.state = {
      modalIsOpen: false,
      email: ''
    };

    this.openModal = this.openModal.bind(this);
    this.afterOpenModal = this.afterOpenModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.submit = this.submit.bind(this)
    this.updateEmail = this.updateEmail.bind(this)
    this.redirect = this.redirect.bind(this)
  }

  redirect() {
    window.location = 'http://eepurl.com/dkKWh1';
  }

  openModal() {
    this.setState({modalIsOpen: true});
  }

  afterOpenModal() {
    // references are now sync'd and can be accessed.
    //this.subtitle.style.color = '#f00';
  }

  closeModal() {
    this.setState({modalIsOpen: false});
  }

  submit() {
    axios.get('/api/join?email=' + this.state.email)
      .then(function(response) {
        console.log(response.data.response);
      }.bind(this))
      .catch(function(error) {
        console.log(error)
      });    
    this.closeModal();
  }

  updateEmail(evt) {
    this.setState({
      email: evt.target.value
    });
  }

  render() {
    return (
      <div>
        <p className="aboutme-text top-space">
          If you'd like to be informed when <b>Stolen Song</b> is published 
          please join my mailing list and I'll keep you up date with the 
          progress.
        </p>
        <div className='wrapper'>
          <button onClick={this.redirect} className="joinbtn btn btn-primary">Join Mailinglist</button>
          <Modal
            isOpen={this.state.modalIsOpen}
            onAfterOpen={this.afterOpenModal}
            onRequestClose={this.closeModal}
            style={customStyles}
            contentLabel="Example Modal"
          >
            <div className="dialog-content">
              <h3 ref={subtitle => this.subtitle = subtitle}>Join</h3>
              <p>
                Add your email address to be added to my mailing list be 
                informed of upcoming releases.  
              </p>
              <p>Privacy is a big issue with me and your email won't be shared
              with anyone who isn't absolutely required to get the email from 
              me to you.
              </p>
              <form>
                <input id="email-submit" value={this.state.email} onChange={evt => this.updateEmail(evt)} />
                <br />
                <button class = "dialog-submit btn btn-primary" onClick={this.submit}>submit</button>
                <button class = "dialog-cancel btn" onClick={this.closeModal}>cancel</button>
              </form>
            </div>
          </Modal>          
        </div>
      </div>
    );
  }
}


ReactDOM.render(
  <Page />,
  document.getElementById('root')
);