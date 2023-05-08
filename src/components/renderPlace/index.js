import React, { Suspense, useEffect, useState, useRef } from "react";
import { DragDropContext } from "react-beautiful-dnd";
import { Droppable, Draggable } from "react-beautiful-dnd";
import { getDraggableItemStyle } from "../../helpers/styleFn.js";
import SideBarRender from "../sidebar";
import axios from "axios";
import { saveAs } from "file-saver";
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
  const [JSONData, setJSONData] = useState(null);

  useEffect(() => {
    const previousElements = JSON.parse(localStorage.getItem("movedElements"));
    if (previousElements && previousElements?.length) {
      setDroppedElements(previousElements);
    }
  }, []);
  useEffect(() => {
    // const previousElements = JSON.parse(localStorage.getItem("movedElements"));
    const previousElements = JSONData;
    console.log(JSONData);
    if (previousElements && previousElements?.length) {
      setDroppedElements(previousElements);
    }
  }, [JSONData]);
  const formik = useFormik({
    initialValues: dropvalue,
    onSubmit: (values) => {
      alert(JSON.stringify(values, null, 2));
    },
    // handleChange: (e) => {
    //   console.log(e);
    // },
    // handle: (e) => {
    //   console.log(e);
    // },
    // validationSchema: validationSchema,
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
      saveFile(droppedElements);
    }
  };
  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) {
      return;
    }

    const fileReader = new FileReader();

    fileReader.onload = () => {
      try {
        const json = JSON.parse(fileReader.result);
        console.log(json);
        setJSONData(json);
      } catch (error) {
        console.error(error);
      }
    };

    fileReader.readAsText(file);
  };

  const saveFile = (jsonData) => {
    const data = jsonData.map((index) => {
      return {
        id: index.id,
        element: index.element,
        value: formik.values[index.id],
      };
    });
    const blob = new Blob([JSON.stringify(data)], {
      type: "application/json;charset=utf-8",
    });
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const second = now.getSeconds();

    const formattedMonth = month < 10 ? `0${month}` : `${month}`;
    const formattedDay = day < 10 ? `0${day}` : `${day}`;
    const formattedHour = hour < 10 ? `0${hour}` : `${hour}`;
    const formattedMinute = minute < 10 ? `0${minute}` : `${minute}`;
    const formattedSecond = second < 10 ? `0${second}` : `${second}`;

    const formattedTime = `${year}${formattedMonth}${formattedDay}${formattedHour}${formattedMinute}${formattedSecond}`;
    saveAs(blob, `${formattedTime}.json`);
    // axios
    //   .post("http://localhost:5000/saveFile/", JSON.stringify(data))
    //   .then((res) => {
    //     console.log(res);
    //     alert("Elements Saved!");
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //   });
  };

  const handleClear = () => {
    setDroppedElements([]);
    localStorage.removeItem("movedElements");
  };

  const openDialog = () => {
    inputRef.current.click();
  };

  const inputRef = useRef(null);

  const returnRespectiveHtmlElement = (type, index, value) => {
    switch (type) {
      case "button":
        return (
          <>
            <button>I'm button</button>
          </>
        );
      case "input":
        return (
          <>
            <input id={index} onChange={formik.handleChange} value={value} />
            {!value ? (
              <div style={{ color: "red" }}>This field is required!</div>
            ) : null}
          </>
        );
      case "textarea":
        return (
          <>
            <textarea id={index} onChange={formik.handleChange} value={value} />
            {!value ? (
              <div style={{ color: "red" }}>This field is required!</div>
            ) : null}
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
              <div
                className="droppable-wrapper"
                ref={provided.innerRef}
                style={{ width: "50%" }}
              >
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
        {/* <button onClick={handleImport} className="import-btn"> */}
        <div>
          <input
            ref={inputRef}
            type="file"
            accept=".json" // optional file types to accept
            onChange={handleImport}
            style={{ display: "none" }}
          />
          <button onClick={openDialog}>Import</button>
        </div>
        {/* </button> */}
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
