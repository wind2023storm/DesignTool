import React, { Suspense, useEffect, useState } from "react";
import { DragDropContext } from "react-beautiful-dnd";
import { Droppable, Draggable } from "react-beautiful-dnd";
import { getDraggableItemStyle } from "../../helpers/styleFn.js";
import SideBarRender from "../sidebar";
import {
  reOrderWithInSameArea,
  reOrderWithOtherArea,
} from "../../helpers/reOrderFn";
// import { generateElement } from "../../helpers/generateUiElements";
import "./renderPlace.css";
import { Form, useFormik } from "formik";
const DroppablePlace = React.lazy(() => import("../droppablePlace"));

const initialElements = [
  { id: "button", element: "Button" },
  { id: "input", element: "Input Box" },
  { id: "textarea", element: "Textarea" },
  { id: "box", element: "Box" },
  { id: "heading", element: "Heading" },
];

const RenderPlace = () => {
  const [sidebarElements, setSideBarElements] = useState(initialElements);
  const [droppedElements, setDroppedElements] = useState([]);
  const [dropvalue, setDropValue] = useState({});

  useEffect(() => {
    const previousElements = JSON.parse(localStorage.getItem("movedElements"));
    if (previousElements && previousElements?.length) {
      setDroppedElements(previousElements);
    }
  }, []);
  const formik = useFormik({
    initialValues: dropvalue,
    onSubmit: (values) => {
      alert(JSON.stringify(values, null, 2));
    },
    handleChange: (e) => {
      console.log(e);
    },
    handle: (e) => {
      console.log(e);
    },
  });

  const generateElement = (type, id) => {
    let uiElement = {};
    uiElement.id = `${id}`;
    uiElement.element = type;
    uiElement.value = "";

    return uiElement;
  };

  const onDragEnd = (result) => {
    const { source, destination, draggableId: selectedElementType } = result;

    if (!destination) return;

    if (source.droppableId === destination.droppableId) {
      let reOrderedValue;
      if (source.droppableId === "sidebar") {
        //handle drop inside sidebar
        reOrderedValue = reOrderWithInSameArea(
          sidebarElements,
          source.index,
          destination.index
        );
        setSideBarElements(reOrderedValue);
      } else {
        reOrderedValue = reOrderWithInSameArea(
          droppedElements,
          source.index,
          destination.index
        );
        setDroppedElements(reOrderedValue);
      }
    } else {
      //handle drop into droppable area
      const newHtmlElement = generateElement(
        selectedElementType,
        droppedElements.length,
        ""
      );

      let temp = dropvalue;

      temp[droppedElements.length] = "";
      setDropValue(temp);
      console.log(dropvalue);

      let valueAfterElementInsertion = reOrderWithOtherArea(
        droppedElements,
        destination.index,
        newHtmlElement
      );
      setDroppedElements(valueAfterElementInsertion);
      console.log(droppedElements);
    }
  };

  const handleSave = () => {
    if (droppedElements?.length) {
      localStorage.setItem("movedElements", JSON.stringify(droppedElements));
      alert("Elements Saved!");
    }
  };

  const handleClear = () => {
    setDroppedElements([]);
    localStorage.removeItem("movedElements");
  };
  const returnRespectiveHtmlElement = (type, index, value) => {
    switch (type) {
      case "button":
        return <><button>I'm button</button></>;
      case "input":
        return (
          <>
            <input id={index} onChange={formik.handleChange} value={value} />
            {!value ? <div>sadfsa</div> : null}
          </>
        );
      case "textarea":
        return (
          <>
            <textarea id={index} onChange={formik.handleChange} value={value} />
            {!value ? <div>afsdfasdf</div> : null}
          </>
        );
      case "box":
        return <div className="box" />;
      case "heading":
        return <h1>Heading1</h1>;
      default:
        return <></>;
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="render-wrapper">
        <SideBarRender sidebarElements={sidebarElements} />
        <Suspense fallback={<div>DroppablePlace loading...</div>}>
          <Droppable droppableId="droppable">
            {(provided, snapshot) => (
              <div className="droppable-wrapper" ref={provided.innerRef}>
                <form>
                  {droppedElements?.length ? (
                    droppedElements?.map((item, index) => (
                      <Draggable
                        key={item.id}
                        draggableId={item.id}
                        index={index}
                      >
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
                            {/* <input id={index} defaultValue="i'm input" onChange={formik.handleChange} value={formik.values[index]} /> */}
                            {returnRespectiveHtmlElement(
                              item.element,
                              item.id,
                              formik.values[item.id]
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))
                  ) : (
                    <p className="help-text">
                      *Drag & Drop some component to start
                    </p>
                  )}
                </form>
              </div>
            )}
          </Droppable>
        </Suspense>
      </div>

      <div className="btn-wrapper">
        <button onClick={handleSave} className="save-btn">
          Save
        </button>
        <button onClick={handleClear} className="clear-btn">
          Clear
        </button>
      </div>
    </DragDropContext>
  );
};

export default RenderPlace;
