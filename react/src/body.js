
import React from 'react';
import axios from 'axios';
//import ReactMarkdown from 'react-markdown'
import './index.css';

import { Textile } from './textile-render.js';

var api_url = "https://api.zenbrewism.com/page/home"
//var api_url = "http://localhost:5000/page/home"

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
      content: "foo",

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
