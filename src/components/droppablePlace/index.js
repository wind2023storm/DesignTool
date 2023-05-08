import React from "react";
import { Droppable, Draggable } from "react-beautiful-dnd";
import { getDraggableItemStyle } from "../../helpers/styleFn.js";
// import { returnRespectiveHtmlElement } from "../../helpers/generateUiElements";
import { useFormik } from 'formik';
import "./droppable.css";

const DroppablePlace = ({ droppedElements }) => {

  const formik = useFormik({
    initialValues: {
    },
    onSubmit: values => {
      alert(JSON.stringify(values, null, 2));
    },
  });

  const returnRespectiveHtmlElement = (type,valuasdf) => {
    switch (type) {
      case "button":
        return <button>I'm button</button>
      case "input":
        return <input defaultValue="i'm input" />
      case "textarea":
        return <textarea defaultValue="i'm text area" />
      case "box":
        return <div className="box" />
      case "heading":
        return <h1>Heading1</h1>
      default:
        return <></>
    }
  }

  return (
    <Droppable droppableId="droppable">
      {(provided, snapshot) => (
        <div className="droppable-wrapper" ref={provided.innerRef}>
          <form>
          {droppedElements?.length ? (
            droppedElements?.map((item, index) => (
              <Draggable key={item.id} draggableId={item.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    className="droppable-element"
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={getDraggableItemStyle(
                      snapshot.isDragging,
                      provided.draggableProps.style
                    )}
                  >
                    {returnRespectiveHtmlElement(item.element)}
                  </div>
                )}
              </Draggable>
            ))
          ) : (
            <p className="help-text">*Drag & Drop some component to start</p>
          )}
          </form>
        </div>
      )}
    </Droppable>
  );
};

export default DroppablePlace;
