import React from 'react';
var textile = require('textile-js');

export class Textile extends React.Component {

   convert(src){
        return { __html: textile(src) };
    }

  render() {
    return (
        <div dangerouslySetInnerHTML={this.convert(this.props.source)}>
        </div>
    );
  }
}
