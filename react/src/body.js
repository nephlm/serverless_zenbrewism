
import React from 'react';
import axios from 'axios';
//import ReactMarkdown from 'react-markdown'
import './index.css';
import { Textile } from './textile-render.js';
import { backendConfig } from './backendConfig.js';
var _ = require('lodash');

var hostname = window.location.hostname;


try {
  var api_root = backendConfig[hostname]['api_root']
} catch(err) {
  var api_root = backendConfig['www.zenbrewism.com']['api_root']
}
var api_url = api_root + 'page/home'
console.log(api_url)

export class Content extends React.Component {
  render() {
    return (
      <div className="outer-left">
        <div className="content">
          <img className="book-title center" src="/static/img/StolenSong_Title.png" />
          <p className="book-subtitle">
            Sylph's Symphony Number 1
          </p>
          <Blurb/>
        </div>
      </div>
    );
  }
}

export class Blurb extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      content: "",

    };
  }

  componentDidMount() {
    axios.get(api_url)
      .then(function(response) {
        console.log(response.data);
        if (response.data == null) {
          console.log('no data')
        } else {
          this.setState({
              isLoaded: true,
              content: response.data.text
            });
          }}.bind(this))
      .catch(function(error) {
        console.log(error)
      });
  }

  render() {
    return (
        <div>
          <Textile source={this.state.content} />
        </div>
    );
  }
}
