//
// Zoom Code taken from:
//   https://stackoverflow.com/a/52640900
//   (with improvements taken from the comments)
//
// Pinch code taken from 
//    https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events/Pinch_zoom_gestures
//    (demo: https://mdn.github.io/dom-examples/pointerevents/Pinch_zoom_gestures.html)
//
function defineZoomOnFlow(svgImage, svgContainer, svgLocation) {
   var viewBox = { x: svgLocation.x, y: svgLocation.y, w: svgImage.clientWidth, h: svgImage.clientHeight };
   const originalViewBox = { ...viewBox };
   const originalStartLocation = { ...svgLocation};

   svgImage.setAttribute('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`);
   const svgSize = { w: svgImage.clientWidth, h: svgImage.clientHeight };
   var isPanning = false;
   var startPoint = svgLocation; // { x: 0, y: 0 };
   var endPoint = svgLocation; // { x: 0, y: 0 };;
   var scale = 1;

   svgContainer.onwheel = function (e) {
      e.preventDefault();

      var w = viewBox.w;
      var h = viewBox.h;
      var mx = e.offsetX;//mouse x  
      var my = e.offsetY;
      var dw = w * Math.sign(e.deltaY) * 0.05;
      var dh = h * Math.sign(e.deltaY) * 0.05;
      var dx = dw * mx / svgSize.w;
      var dy = dh * my / svgSize.h;
      viewBox = { 
         x: viewBox.x + dx, 
         y: viewBox.y + dy, 
         w: viewBox.w - dw, 
         h: viewBox.h - dh 
      };
      
      scale = svgSize.w / viewBox.w;
      svgImage.setAttribute('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`);
   }

   svgContainer.onmousedown = function (e) {
      isPanning = true;
      startPoint = { x: e.x, y: e.y };
   }

   svgContainer.onmousemove = function (e) {
      if (isPanning) {
         endPoint = { x: e.x, y: e.y };
         var dx = (startPoint.x - endPoint.x) / scale;
         var dy = (startPoint.y - endPoint.y) / scale;
         var movedViewBox = { x: viewBox.x + dx, y: viewBox.y + dy, w: viewBox.w, h: viewBox.h };
         svgImage.setAttribute('viewBox', `${movedViewBox.x} ${movedViewBox.y} ${movedViewBox.w} ${movedViewBox.h}`);
      }
   }

   svgContainer.onmouseup = function (e) {
      if (isPanning) {
         endPoint = { x: e.x, y: e.y };
         var dx = (startPoint.x - endPoint.x) / scale;
         var dy = (startPoint.y - endPoint.y) / scale;
         viewBox = { x: viewBox.x + dx, y: viewBox.y + dy, w: viewBox.w, h: viewBox.h };
         svgImage.setAttribute('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`);
         isPanning = false;
      }
   }

   svgContainer.onmouseleave = function (e) {
      isPanning = false;
   }

   /* Pinch code starts here */
   const evCache = [];
   let prevDiff = -1;

   svgContainer.ondblclick = function (e) {
      viewBox = { ...originalViewBox };
      
      svgImage.setAttribute('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`);
      startPoint = { ...originalStartLocation };
      endPoint = { ...originalStartLocation };
      prevDiff = -1;
      scale = 1;
   }

   function log(msg, evnt) {
      // console.log(msg, evnt); /* not that this does much on mobile */
   }

   function removeEvent(ev) {
      // Remove this event from the target's cache
      const index = evCache.findIndex(
         (cachedEv) => cachedEv.pointerId === ev.pointerId
      );
      evCache.splice(index, 1);
   }

   function pointerdownHandler(ev) {
      // The pointerdown event signals the start of a touch interaction.
      // This event is cached to support 2-finger gestures
      evCache.push(ev);

      log("pointerDown", ev);
   }
   function pointerupHandler(ev) {
      log(ev.type, ev);
      removeEvent(ev);

      if (evCache.length < 2) {
         prevDiff = -1;
      }
   }
   function pointermoveHandler(ev) {
      // This function implements a 2-pointer horizontal pinch/zoom gesture.
      //
      // If the distance between the two pointers has increased (zoom in),
      // the target element's background is changed to "pink" and if the
      // distance is decreasing (zoom out), the color is changed to "lightblue".
      //
      // This function sets the target element's border to "dashed" to visually
      // indicate the pointer's target received a move event.
      log("pointerMove", ev);
      //ev.target.style.border = "dashed";

      // Find this event in the cache and update its record with this event
      const index = evCache.findIndex(
         (cachedEv) => cachedEv.pointerId === ev.pointerId
      );
      evCache[index] = ev;

      // If two pointers are down, check for pinch gestures
      if (evCache.length === 2) {
         // Calculate the distance between the two pointers
         const curDiff = Math.abs(evCache[0].clientX - evCache[1].clientX);

         ev.deltaY = evCache[0].clientY - evCache[1].clientY;


         var w = viewBox.w;
         var h = viewBox.h;
         var mx = ev.clientX;//mouse x  
         var my = ev.clientY;
         var dw = w * Math.sign(ev.deltaY) * 0.05;
         var dh = h * Math.sign(ev.deltaY) * 0.05;
         var dx = dw * mx / svgSize.w;
         var dy = dh * my / svgSize.h;
         viewBox = {
            x: viewBox.x + dx,
            y: viewBox.y + dy,
            w: viewBox.w - dw,
            h: viewBox.h - dh
         };
         scale = svgSize.w / viewBox.w;
         //zoomValue.innerText = `${Math.round(scale * 100) / 100}`;
         svgImage.setAttribute('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`);

         // Cache the distance for the next move event
         prevDiff = curDiff;
      }
   }

   svgImage.onpointerdown = pointerdownHandler;
   svgImage.onpointermove = pointermoveHandler;

   // Use same handler for pointer{up,cancel,out,leave} events since
   // the semantics for these events - in this app - are the same.
   svgImage.onpointerup = pointerupHandler;
   svgImage.onpointercancel = pointerupHandler;
   svgImage.onpointerout = pointerupHandler;
   svgImage.onpointerleave = pointerupHandler;
}