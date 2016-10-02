import React from 'react';
import classNames from 'classnames';

function Icon(props) {
  const {type, className, style} = props;
  // Append fa- prefix to all icon type classes, then add other classes as they are
  let classes = classNames('fa', type.split(' ').map(c => 'fa-'+c), className);
  return <i className={classes} style={style} />
}

export default Icon;