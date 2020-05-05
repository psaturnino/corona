import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MoreVertIcon from '@material-ui/icons/MoreVert';


const ITEM_HEIGHT = 48;

export default function LongMenu (props) {

  let options = [];
  
  if (props && props.scenes && props.scenes.length) options.push("Delete Scene")
  
  if (props && props.scenes && props.scenes.length) {
    let scenes_ = []
    for (let index = 1; index <= props.scenes.length; index++) {
      scenes_.push("Scene "+index);
    }
    
    options = options.concat(scenes_)
  }


  
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClickItem = (scene) => {
    props.handleClick(scene)
  }

  return (
    <div className={props.class}>
      <IconButton
        aria-label="more"
        aria-controls="long-menu"
        aria-haspopup="true"
        onClick={handleClick}
        style={{outline: "none"}}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id="long-menu"
        anchorEl={anchorEl}
        keepMounted
        open={open}
        onClose={handleClose}
        PaperProps={{
          style: {
            maxHeight: ITEM_HEIGHT * 4.5,
            width: '20ch',
          },
        }}
      >
        <MenuItem key={-1} onClick={() => {handleClose(); handleClickItem(-1)}}>New Scene</MenuItem>
        {options.map((option, key) => (
          <MenuItem key={key} selected={option === ''} onClick={() => {handleClose(); handleClickItem(key)}}>
            {option}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
}
