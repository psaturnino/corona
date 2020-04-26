import React, {Component} from 'react';
import {SortableContainer, SortableElement} from 'react-sortable-hoc';
import arrayMove from 'array-move';

const SortableItem = SortableElement(({value, handleClick, editCountries}) => { 
  return <button className={`grid-square btnCustom blue btn-sm mt-1 ${value.status?"sel":""} ${editCountries?"remove":""}`} onClick={() => {handleClick(value)}}>{value.name}</button>
});


const SortableList = SortableContainer(({items, handleClick, editCountries}) => {
  return (
    <div>
      {items.map((value, index) => (
        <SortableItem key={`item-${value.name}`} index={index} value={value} handleClick={handleClick} editCountries={editCountries} />
      ))}
    </div>
  );
});

export default class SortableComponent extends Component {
  state = {
    items: this.props.countries,
    
  };

  componentDidUpdate(prevPros) {
    if (prevPros.countries !== this.props.countries) {
      this.setState({items: this.props.countries})
    }
  }

  onSortEnd = ({oldIndex, newIndex}) => {
    this.setState(({items}) => ({
      items: arrayMove(items, oldIndex, newIndex),
    }));
  };
  render() {
    return <SortableList items={this.state.items} handleClick={this.props.handleClick} editCountries={this.props.editCountries} onSortEnd={this.onSortEnd} />;
  }
}

