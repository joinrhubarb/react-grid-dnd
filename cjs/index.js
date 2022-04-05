'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var tslib_1 = require('tslib');
var React = require('react');
var ResizeObserver = require('resize-observer-polyfill');
var reactSpring = require('react-spring');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n["default"] = e;
  return Object.freeze(n);
}

var tslib_1__namespace = /*#__PURE__*/_interopNamespace(tslib_1);
var React__namespace = /*#__PURE__*/_interopNamespace(React);
var ResizeObserver__default = /*#__PURE__*/_interopDefaultLegacy(ResizeObserver);

/**
 * Get the active drag position given its initial
 * coordinates and grid meta
 * @param index
 * @param grid
 * @param dx
 * @param dy
 */
function getDragPosition(index, grid, dx, dy, center) {
    var _a = tslib_1.__read(getPositionForIndex(index, grid).xy, 2), left = _a[0], top = _a[1];
    return {
        xy: [
            left + dx + (center ? grid.columnWidth / 2 : 0),
            top + dy + (center ? grid.rowHeight / 2 : 0)
        ]
    };
}
/**
 * Get the relative top, left position for a particular
 * index in a grid
 * @param i
 * @param grid
 * @param traverseIndex (destination for traverse)
 */
function getPositionForIndex(i, _a, traverseIndex) {
    var boxesPerRow = _a.boxesPerRow, rowHeight = _a.rowHeight, columnWidth = _a.columnWidth;
    var index = typeof traverseIndex == "number" ? (i >= traverseIndex ? i + 1 : i) : i;
    var x = (index % boxesPerRow) * columnWidth;
    var y = Math.floor(index / boxesPerRow) * rowHeight;
    return {
        xy: [x, y]
    };
}
/**
 * Given relative coordinates, determine which index
 * we are currently in
 * @param x
 * @param y
 * @param param2
 */
function getIndexFromCoordinates(x, y, _a, count) {
    var rowHeight = _a.rowHeight, boxesPerRow = _a.boxesPerRow, columnWidth = _a.columnWidth;
    var index = Math.floor(y / rowHeight) * boxesPerRow + Math.floor(x / columnWidth);
    return index >= count ? count : index;
}
/**
 * Get the target index during a drag
 * @param startIndex
 * @param grid
 * @param count
 * @param dx
 * @param dy
 */
function getTargetIndex(startIndex, grid, count, dx, dy) {
    var _a = tslib_1.__read(getDragPosition(startIndex, grid, dx, dy, true).xy, 2), cx = _a[0], cy = _a[1];
    return getIndexFromCoordinates(cx, cy, grid, count);
}

var noop = function () {
    throw new Error("Make sure that you have wrapped your drop zones with GridContext");
};
var GridContext = React__namespace.createContext({
    register: noop,
    remove: noop,
    getActiveDropId: noop,
    startTraverse: noop,
    measureAll: noop,
    traverse: null,
    endTraverse: noop,
    onChange: noop
});
function GridContextProvider(_a) {
    var children = _a.children, onChange = _a.onChange;
    var _b = tslib_1.__read(React__namespace.useState(null), 2), traverse = _b[0], setTraverse = _b[1];
    var dropRefs = React__namespace.useRef(new Map());
    /**
     * Register a drop zone with relevant information
     * @param id
     * @param options
     */
    function register(id, options) {
        dropRefs.current.set(id, options);
    }
    /**
     * Remove a drop zone (typically on unmount)
     * @param id
     */
    function remove(id) {
        dropRefs.current.delete(id);
    }
    /**
     * Determine the fixed position (pageX) of an item
     * @param sourceId
     * @param rx relative x
     * @param ry relative y
     */
    function getFixedPosition(sourceId, rx, ry) {
        var item = dropRefs.current.get(sourceId);
        // When items are removed from the DOM, the left and top values could be undefined.
        if (!item) {
            return {
                x: rx,
                y: ry
            };
        }
        var left = item.left, top = item.top;
        return {
            x: left + rx,
            y: top + ry
        };
    }
    /**
     * Get a relative position for a target dropzone given
     * a fixed position
     * @param targetId
     * @param fx fixed x
     * @param fy fixed y
     */
    function getRelativePosition(targetId, fx, fy) {
        var _a = dropRefs.current.get(targetId), left = _a.left, top = _a.top;
        return {
            x: fx - left,
            y: fy - top
        };
    }
    /**
     * Determine the difference in coordinates between
     * two dropzones
     * @param sourceId
     * @param targetId
     */
    function diffDropzones(sourceId, targetId) {
        var sBounds = dropRefs.current.get(sourceId);
        var tBounds = dropRefs.current.get(targetId);
        return {
            x: tBounds.left - sBounds.left,
            y: tBounds.top - sBounds.top
        };
    }
    /**
     * Determine which dropzone we are actively dragging over
     * @param sourceId
     * @param x
     * @param y
     */
    function getActiveDropId(sourceId, x, y) {
        var e_1, _a;
        var _b = getFixedPosition(sourceId, x, y), fx = _b.x, fy = _b.y;
        try {
            // probably faster just using an array for dropRefs
            for (var _c = tslib_1.__values(dropRefs.current.entries()), _d = _c.next(); !_d.done; _d = _c.next()) {
                var _e = tslib_1.__read(_d.value, 2), key = _e[0], bounds = _e[1];
                if (!bounds.disableDrop &&
                    fx > bounds.left &&
                    fx < bounds.right &&
                    fy > bounds.top &&
                    fy < bounds.bottom) {
                    return key;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return null;
    }
    /**
     * Trigger a traversal (when one item is being dropped
     * on a different dropzone)
     * @param sourceId
     * @param targetId
     * @param x
     * @param y
     * @param sourceIndex
     */
    function startTraverse(sourceId, targetId, x, y, sourceIndex) {
        var _a = getFixedPosition(sourceId, x, y), fx = _a.x, fy = _a.y;
        var _b = getRelativePosition(targetId, fx, fy), rx = _b.x, ry = _b.y;
        var _c = dropRefs.current.get(targetId), targetGrid = _c.grid, count = _c.count;
        var targetIndex = getIndexFromCoordinates(rx + targetGrid.columnWidth / 2, ry + targetGrid.rowHeight / 2, targetGrid, count);
        var _d = tslib_1.__read(getPositionForIndex(targetIndex, targetGrid).xy, 2), px = _d[0], py = _d[1];
        var _e = diffDropzones(sourceId, targetId), dx = _e.x, dy = _e.y;
        // only update traverse if targetId or targetIndex have changed
        if (!traverse ||
            !(traverse &&
                traverse.targetIndex !== targetIndex &&
                traverse.targetId !== targetId)) {
            setTraverse({
                rx: px + dx,
                ry: py + dy,
                tx: rx,
                ty: ry,
                sourceId: sourceId,
                targetId: targetId,
                sourceIndex: sourceIndex,
                targetIndex: targetIndex
            });
        }
    }
    /**
     * End any active traversals
     */
    function endTraverse() {
        setTraverse(null);
    }
    /**
     * Perform a change to list item arrays.
     * If it doesn't include targetId, it's a switch
     * of order within the one array itself.
     */
    function onSwitch(sourceId, sourceIndex, targetIndex, targetId) {
        // this is a bit hacky, but seems to work for now. The idea
        // is that we want our newly mounted traversed grid item
        // to start its animation from the last target location.
        // Execute informs our GridDropZone to remove the placeholder
        // but to pass the initial location to the newly mounted
        // grid item at the specified index.
        // The problem here is that it's async, so potentially something
        // could mount in its place in between setTraversal and onChange
        // executing. Or maybe onChange won't do anything, in which case
        // our state is kinda messed up.
        // So it's sorta a controlled component, but not really, because
        // if you don't do what we suggest, then it gets messed up.
        // One solution is to bring the state in-component and force
        // the state to be updated by us, since it's basically required
        // anyway.
        // We could possibly also use a unique identifier for the grid (besides
        // the index). This could still result in weirdness, but would
        // be more unlikely.
        // Ultimately it's kinda messed because we are trying to do something
        // imperative in a declarative interface.
        setTraverse(tslib_1.__assign(tslib_1.__assign({}, traverse), { execute: true }));
        onChange(sourceId, sourceIndex, targetIndex, targetId);
    }
    function measureAll() {
        dropRefs.current.forEach(function (ref) {
            ref.remeasure();
        });
    }
    return (React__namespace.createElement(GridContext.Provider, { value: {
            register: register,
            remove: remove,
            getActiveDropId: getActiveDropId,
            startTraverse: startTraverse,
            traverse: traverse,
            measureAll: measureAll,
            endTraverse: endTraverse,
            onChange: onSwitch
        } }, children));
}

function useMeasure(ref) {
    var _a = tslib_1.__read(React__namespace.useState({
        left: 0,
        top: 0,
        width: 0,
        height: 0,
        right: 0,
        bottom: 0
    }), 2), bounds = _a[0], setBounds = _a[1];
    var _b = tslib_1.__read(React__namespace.useState(function () {
        return new ResizeObserver__default["default"](function (_a) {
            var _b = tslib_1.__read(_a, 1), entry = _b[0];
            setBounds(entry.target.getBoundingClientRect());
        });
    }), 1), observer = _b[0];
    React__namespace.useLayoutEffect(function () {
        if (ref.current) {
            observer.observe(ref.current);
        }
        return function () { return observer.disconnect(); };
    }, [ref, observer]);
    function remeasure() {
        setBounds(ref.current.getBoundingClientRect());
    }
    return { bounds: bounds, remeasure: remeasure };
}

function swap(array, moveIndex, toIndex) {
    /* #move - Moves an array item from one position in an array to another.
       Note: This is a pure function so a new array will be returned, instead
       of altering the array argument.
      Arguments:
      1. array     (String) : Array in which to move an item.         (required)
      2. moveIndex (Object) : The index of the item to move.          (required)
      3. toIndex   (Object) : The index to move item at moveIndex to. (required)
    */
    var item = array[moveIndex];
    var length = array.length;
    var diff = moveIndex - toIndex;
    if (diff > 0) {
        // move left
        return tslib_1.__spreadArray(tslib_1.__spreadArray(tslib_1.__spreadArray(tslib_1.__spreadArray([], tslib_1.__read(array.slice(0, toIndex)), false), [
            item
        ], false), tslib_1.__read(array.slice(toIndex, moveIndex)), false), tslib_1.__read(array.slice(moveIndex + 1, length)), false);
    }
    else if (diff < 0) {
        // move right
        var targetIndex = toIndex + 1;
        return tslib_1.__spreadArray(tslib_1.__spreadArray(tslib_1.__spreadArray(tslib_1.__spreadArray([], tslib_1.__read(array.slice(0, moveIndex)), false), tslib_1.__read(array.slice(moveIndex + 1, targetIndex)), false), [
            item
        ], false), tslib_1.__read(array.slice(targetIndex, length)), false);
    }
    return array;
}

var GridItemContext = React__namespace.createContext(null);

function GridDropZone(_a) {
    var _b;
    var id = _a.id, boxesPerRow = _a.boxesPerRow, children = _a.children, style = _a.style, _c = _a.disableDrag, disableDrag = _c === void 0 ? false : _c, _d = _a.disableDrop, disableDrop = _d === void 0 ? false : _d, rowHeight = _a.rowHeight, other = tslib_1.__rest(_a, ["id", "boxesPerRow", "children", "style", "disableDrag", "disableDrop", "rowHeight"]);
    var _e = React__namespace.useContext(GridContext), traverse = _e.traverse, startTraverse = _e.startTraverse, endTraverse = _e.endTraverse, register = _e.register, measureAll = _e.measureAll, onChange = _e.onChange, remove = _e.remove, getActiveDropId = _e.getActiveDropId;
    var ref = React__namespace.useRef(null);
    var _f = useMeasure(ref), bounds = _f.bounds, remeasure = _f.remeasure;
    var _g = tslib_1.__read(React__namespace.useState(null), 2), draggingIndex = _g[0], setDraggingIndex = _g[1];
    var _h = tslib_1.__read(React__namespace.useState(null), 2), placeholder = _h[0], setPlaceholder = _h[1];
    var traverseIndex = traverse && !traverse.execute && traverse.targetId === id
        ? traverse.targetIndex
        : null;
    var grid = {
        columnWidth: bounds.width / boxesPerRow,
        boxesPerRow: boxesPerRow,
        rowHeight: rowHeight
    };
    var childCount = React__namespace.Children.count(children);
    /**
     * Register our dropzone with our grid context
     */
    React__namespace.useEffect(function () {
        register(id, {
            top: bounds.top,
            bottom: bounds.bottom,
            left: bounds.left,
            right: bounds.right,
            width: bounds.width,
            height: bounds.height,
            count: childCount,
            grid: grid,
            disableDrop: disableDrop,
            remeasure: remeasure
        });
    }, [childCount, disableDrop, bounds, id, grid]);
    /**
     * Unregister when unmounting
     */
    React__namespace.useEffect(function () {
        return function () { return remove(id); };
    }, [id]);
    // keep an initial list of our item indexes. We use this
    // when animating swap positions on drag events
    var itemsIndexes = (_b = React__namespace.Children.map(children, function (_, i) { return i; })) !== null && _b !== void 0 ? _b : [];
    return (React__namespace.createElement("div", tslib_1.__assign({ ref: ref, style: tslib_1.__assign({ position: "relative" }, style) }, other), grid.columnWidth === 0
        ? null
        : React__namespace.Children.map(children, function (child, i) {
            var isTraverseTarget = traverse &&
                traverse.targetId === id &&
                traverse.targetIndex === i;
            var order = placeholder
                ? swap(itemsIndexes, placeholder.startIndex, placeholder.targetIndex)
                : itemsIndexes;
            var pos = getPositionForIndex(order.indexOf(i), grid, traverseIndex);
            /**
             * Handle a child being dragged
             * @param state
             * @param x
             * @param y
             */
            function onMove(state, x, y) {
                if (!ref.current)
                    return;
                if (draggingIndex !== i) {
                    setDraggingIndex(i);
                }
                var targetDropId = getActiveDropId(id, x + grid.columnWidth / 2, y + grid.rowHeight / 2);
                if (targetDropId && targetDropId !== id) {
                    startTraverse(id, targetDropId, x, y, i);
                }
                else {
                    endTraverse();
                }
                var targetIndex = targetDropId !== id
                    ? childCount
                    : getTargetIndex(i, grid, childCount, state.delta[0], state.delta[1]);
                if (targetIndex !== i) {
                    if ((placeholder && placeholder.targetIndex !== targetIndex) ||
                        !placeholder) {
                        setPlaceholder({
                            targetIndex: targetIndex,
                            startIndex: i
                        });
                    }
                }
                else if (placeholder) {
                    setPlaceholder(null);
                }
            }
            /**
             * Handle drag end events
             */
            function onEnd(state, x, y) {
                var targetDropId = getActiveDropId(id, x + grid.columnWidth / 2, y + grid.rowHeight / 2);
                var targetIndex = targetDropId !== id
                    ? childCount
                    : getTargetIndex(i, grid, childCount, state.delta[0], state.delta[1]);
                // traverse?
                if (traverse) {
                    onChange(traverse.sourceId, traverse.sourceIndex, traverse.targetIndex, traverse.targetId);
                }
                else {
                    onChange(id, i, targetIndex);
                }
                setPlaceholder(null);
                setDraggingIndex(null);
            }
            function onStart() {
                measureAll();
            }
            return (React__namespace.createElement(GridItemContext.Provider, { value: {
                    top: pos.xy[1],
                    disableDrag: disableDrag,
                    endTraverse: endTraverse,
                    mountWithTraverseTarget: isTraverseTarget
                        ? [traverse.tx, traverse.ty]
                        : undefined,
                    left: pos.xy[0],
                    i: i,
                    onMove: onMove,
                    onEnd: onEnd,
                    onStart: onStart,
                    grid: grid,
                    dragging: i === draggingIndex
                } }, child));
        })));
}

function move(source, destination, droppableSource, droppableDestination) {
    var sourceClone = Array.from(source);
    var destClone = Array.from(destination);
    var _a = tslib_1.__read(sourceClone.splice(droppableSource, 1), 1), removed = _a[0];
    destClone.splice(droppableDestination, 0, removed);
    return [sourceClone, destClone];
}

var canUseDOM = !!(typeof window !== "undefined" &&
    window.document &&
    window.document.createElement);
var isEnabled = false;
var MOUSE_MOVE_THRESHOLD = 1000;
var lastTouchTimestamp = 0;
function enableMouse() {
    if (isEnabled || Date.now() - lastTouchTimestamp < MOUSE_MOVE_THRESHOLD) {
        return;
    }
    isEnabled = true;
}
function disableMouse() {
    lastTouchTimestamp = Date.now();
    if (isEnabled) {
        isEnabled = false;
    }
}
if (canUseDOM) {
    document.addEventListener("touchstart", disableMouse, true);
    document.addEventListener("touchmove", disableMouse, true);
    document.addEventListener("mousemove", enableMouse, true);
}
function isMouseEnabled() {
    return isEnabled;
}

var initialState = {
    time: Date.now(),
    xy: [0, 0],
    delta: [0, 0],
    initial: [0, 0],
    previous: [0, 0],
    direction: [0, 0],
    initialDirection: [0, 0],
    local: [0, 0],
    lastLocal: [0, 0],
    velocity: 0,
    distance: 0
};
var defaultConfig = {
    enableMouse: true
};
var grantedTouch = null;
function useGestureResponder(options, config) {
    if (options === void 0) { options = {}; }
    if (config === void 0) { config = {}; }
    var state = React__namespace.useRef(initialState);
    var _a = tslib_1__namespace.__assign({}, defaultConfig, config), uid = _a.uid, enableMouse = _a.enableMouse;
    var id = React__namespace.useRef(uid || Math.random());
    var pressed = React__namespace.useRef(false);
    var callbackRefs = React__namespace.useRef(options);
    React__namespace.useEffect(function () {
        callbackRefs.current = options;
    }, [options]);
    function claimTouch(e) {
        if (grantedTouch && grantedTouch.onTerminationRequest(e)) {
            grantedTouch.onTerminate(e);
            grantedTouch = null;
        }
        attemptGrant(e);
    }
    function attemptGrant(e) {
        if (grantedTouch) {
            return;
        }
        grantedTouch = {
            id: id.current,
            onTerminate: onTerminate,
            onTerminationRequest: onTerminationRequest
        };
        onGrant(e);
    }
    function bindGlobalMouseEvents() {
        window.addEventListener("mousemove", handleMoveMouse, false);
        window.addEventListener("mousemove", handleMoveMouseCapture, true);
        window.addEventListener("mouseup", handleEndMouse);
    }
    function unbindGlobalMouseEvents() {
        window.removeEventListener("mousemove", handleMoveMouse, false);
        window.removeEventListener("mousemove", handleMoveMouseCapture, true);
        window.removeEventListener("mouseup", handleEndMouse);
    }
    function handleStartCapture(e) {
        updateStartState(e);
        pressed.current = true;
        var granted = onStartShouldSetCapture(e);
        if (granted) {
            attemptGrant(e);
        }
    }
    function handleStart(e) {
        updateStartState(e);
        pressed.current = true;
        bindGlobalMouseEvents();
        var granted = onStartShouldSet(e);
        if (granted) {
            attemptGrant(e);
        }
    }
    function isGrantedTouch() {
        return grantedTouch && grantedTouch.id === id.current;
    }
    function handleEnd(e) {
        pressed.current = false;
        unbindGlobalMouseEvents();
        if (!isGrantedTouch()) {
            return;
        }
        grantedTouch = null;
        onRelease(e);
    }
    function handleMoveCapture(e) {
        updateMoveState(e);
        if (isGrantedTouch()) {
            return;
        }
        if (onMoveShouldSetCapture(e)) {
            claimTouch(e);
        }
    }
    function handleMove(e) {
        if (isGrantedTouch()) {
            onMove(e);
            return;
        }
        if (onMoveShouldSet(e)) {
            claimTouch(e);
        }
    }
    function onStartShouldSet(e) {
        return callbackRefs.current.onStartShouldSet
            ? callbackRefs.current.onStartShouldSet(state.current, e)
            : false;
    }
    function onStartShouldSetCapture(e) {
        return callbackRefs.current.onStartShouldSetCapture
            ? callbackRefs.current.onStartShouldSetCapture(state.current, e)
            : false;
    }
    function onMoveShouldSet(e) {
        return callbackRefs.current.onMoveShouldSet
            ? callbackRefs.current.onMoveShouldSet(state.current, e)
            : false;
    }
    function onMoveShouldSetCapture(e) {
        return callbackRefs.current.onMoveShouldSetCapture
            ? callbackRefs.current.onMoveShouldSetCapture(state.current, e)
            : false;
    }
    function onGrant(e) {
        if (callbackRefs.current.onGrant) {
            callbackRefs.current.onGrant(state.current, e);
        }
    }
    function updateStartState(e) {
        var _a = e.touches && e.touches[0] ? e.touches[0] : e, pageX = _a.pageX, pageY = _a.pageY;
        var s = state.current;
        state.current = tslib_1__namespace.__assign({}, initialState, { lastLocal: s.lastLocal || initialState.lastLocal, xy: [pageX, pageY], initial: [pageX, pageY], previous: [pageX, pageY], time: Date.now() });
    }
    function updateMoveState(e) {
        var _a = e.touches && e.touches[0] ? e.touches[0] : e, pageX = _a.pageX, pageY = _a.pageY;
        var s = state.current;
        var time = Date.now();
        var x_dist = pageX - s.xy[0];
        var y_dist = pageY - s.xy[1];
        var delta_x = pageX - s.initial[0];
        var delta_y = pageY - s.initial[1];
        var distance = Math.sqrt(delta_x * delta_x + delta_y * delta_y);
        var len = Math.sqrt(x_dist * x_dist + y_dist * y_dist);
        var scaler = 1 / (len || 1);
        var velocity = len / (time - s.time);
        var initialDirection = s.initialDirection[0] !== 0 || s.initialDirection[1] !== 0
            ? s.initialDirection
            : [delta_x * scaler, delta_y * scaler];
        state.current = tslib_1__namespace.__assign({}, state.current, { time: time, xy: [pageX, pageY], initialDirection: initialDirection, delta: [delta_x, delta_y], local: [
                s.lastLocal[0] + pageX - s.initial[0],
                s.lastLocal[1] + pageY - s.initial[1]
            ], velocity: time - s.time === 0 ? s.velocity : velocity, distance: distance, direction: [x_dist * scaler, y_dist * scaler], previous: s.xy });
    }
    function onMove(e) {
        if (pressed.current && callbackRefs.current.onMove) {
            callbackRefs.current.onMove(state.current, e);
        }
    }
    function onRelease(e) {
        var s = state.current;
        state.current = tslib_1__namespace.__assign({}, state.current, { lastLocal: s.local });
        if (callbackRefs.current.onRelease) {
            callbackRefs.current.onRelease(state.current, e);
        }
        grantedTouch = null;
    }
    function onTerminationRequest(e) {
        return callbackRefs.current.onTerminationRequest
            ? callbackRefs.current.onTerminationRequest(state.current, e)
            : true;
    }
    function onTerminate(e) {
        var s = state.current;
        state.current = tslib_1__namespace.__assign({}, state.current, { lastLocal: s.local });
        if (callbackRefs.current.onTerminate) {
            callbackRefs.current.onTerminate(state.current, e);
        }
    }
    function handleMoveMouse(e) {
        if (isMouseEnabled()) {
            handleMove(e);
        }
    }
    function handleMoveMouseCapture(e) {
        if (isMouseEnabled()) {
            handleMoveCapture(e);
        }
    }
    function handleEndMouse(e) {
        if (isMouseEnabled()) {
            handleEnd(e);
        }
    }
    React__namespace.useEffect(function () { return unbindGlobalMouseEvents; }, []);
    function terminateCurrentResponder() {
        if (grantedTouch) {
            grantedTouch.onTerminate();
            grantedTouch = null;
        }
    }
    function getCurrentResponder() {
        return grantedTouch;
    }
    var touchEvents = {
        onTouchStart: handleStart,
        onTouchEnd: handleEnd,
        onTouchMove: handleMove,
        onTouchStartCapture: handleStartCapture,
        onTouchMoveCapture: handleMoveCapture
    };
    var mouseEvents = enableMouse
        ? {
            onMouseDown: function (e) {
                if (isMouseEnabled()) {
                    handleStart(e);
                }
            },
            onMouseDownCapture: function (e) {
                if (isMouseEnabled()) {
                    handleStartCapture(e);
                }
            }
        }
        : {};
    return {
        bind: tslib_1__namespace.__assign({}, touchEvents, mouseEvents),
        terminateCurrentResponder: terminateCurrentResponder,
        getCurrentResponder: getCurrentResponder
    };
}

function GridItem(_a) {
    var children = _a.children, style = _a.style, className = _a.className, other = tslib_1.__rest(_a, ["children", "style", "className"]);
    var context = React__namespace.useContext(GridItemContext);
    if (!context) {
        throw Error("Unable to find GridItem context. Please ensure that GridItem is used as a child of GridDropZone");
    }
    var top = context.top, disableDrag = context.disableDrag, endTraverse = context.endTraverse, onStart = context.onStart, mountWithTraverseTarget = context.mountWithTraverseTarget, left = context.left, i = context.i, onMove = context.onMove, onEnd = context.onEnd, grid = context.grid, isDragging = context.dragging;
    var columnWidth = grid.columnWidth, rowHeight = grid.rowHeight;
    var dragging = React__namespace.useRef(false);
    var startCoords = React__namespace.useRef([left, top]);
    var _b = tslib_1.__read(reactSpring.useSpring(function () {
        if (mountWithTraverseTarget) {
            // this feels really brittle. unsure of a better
            // solution for now.
            var mountXY = mountWithTraverseTarget;
            endTraverse();
            return {
                xy: mountXY,
                immediate: true,
                zIndex: "1",
                scale: 1.1,
                opacity: 0.8
            };
        }
        return {
            xy: [left, top],
            immediate: true,
            zIndex: "0",
            scale: 1,
            opacity: 1
        };
    }), 2), styles = _b[0], set = _b[1];
    // handle move updates imperatively
    function handleMove(state, e) {
        var x = startCoords.current[0] + state.delta[0];
        var y = startCoords.current[1] + state.delta[1];
        set({
            xy: [x, y],
            zIndex: "1",
            immediate: true,
            opacity: 0.8,
            scale: 1.1
        });
        onMove(state, x, y);
    }
    // handle end of drag
    function handleEnd(state) {
        var x = startCoords.current[0] + state.delta[0];
        var y = startCoords.current[1] + state.delta[1];
        dragging.current = false;
        onEnd(state, x, y);
    }
    var bind = useGestureResponder({
        onMoveShouldSet: function (state) {
            if (disableDrag) {
                return false;
            }
            onStart();
            startCoords.current = [left, top];
            dragging.current = true;
            return true;
        },
        onMove: handleMove,
        onTerminationRequest: function () {
            if (dragging.current) {
                return false;
            }
            return true;
        },
        onTerminate: handleEnd,
        onRelease: handleEnd
    }, {
        enableMouse: true
    }).bind;
    /**
     * Update our position when left or top
     * values change
     */
    React__namespace.useEffect(function () {
        if (!dragging.current) {
            set({
                xy: [left, top],
                zIndex: "0",
                opacity: 1,
                scale: 1,
                immediate: false
            });
        }
    }, [dragging.current, left, top]);
    var props = tslib_1.__assign(tslib_1.__assign(tslib_1.__assign({ className: "GridItem" +
            (isDragging ? " dragging" : "") +
            (!!disableDrag ? " disabled" : "") +
            className
            ? " ".concat(className)
            : "" }, bind), { style: tslib_1.__assign({ cursor: !!disableDrag ? "grab" : undefined, zIndex: styles.zIndex, position: "absolute", width: columnWidth + "px", opacity: styles.opacity, height: rowHeight + "px", boxSizing: "border-box", transform: reactSpring.interpolate([styles.xy, styles.scale], function (xy, s) {
                return "translate3d(".concat(xy[0], "px, ").concat(xy[1], "px, 0) scale(").concat(s, ")");
            }) }, style) }), other);
    return typeof children === "function" ? (children(reactSpring.animated.div, props, {
        dragging: isDragging,
        disabled: !!disableDrag,
        i: i,
        grid: grid
    })) : (
    // @ts-ignore
    React__namespace.createElement(reactSpring.animated.div, tslib_1.__assign({}, props), children));
}

exports.GridContext = GridContext;
exports.GridContextProvider = GridContextProvider;
exports.GridDropZone = GridDropZone;
exports.GridItem = GridItem;
exports.move = move;
exports.swap = swap;
//# sourceMappingURL=index.js.map
