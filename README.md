## Unofficial Node-RED flow viewer

Create renderings of your Node-RED flows in the browser.

This:

```
[{"id":"95114553b51edb0e","type":"group","z":"1cf772ae2066495e","style":{"stroke":"#999999","stroke-opacity":"1","fill":"none","fill-opacity":"1","label":true,"label-position":"nw","color":"#a4a4a4"},"nodes":["90aee4ed68c9b0d4","9566742be56e5253","e4fc9a0bc5334568"],"x":66,"y":148,"w":1072,"h":420.5},{"id":"9566742be56e5253","type":"group","z":"1cf772ae2066495e","g":"95114553b51edb0e","name":"Fails","style":{"label":true},"nodes":["6f3ef30b39769654","d5b30c5a1123d50e","0a5eea257dc1fa82","129e1f3418ce8fce","a66882716c7e581f"],"x":335,"y":174,"w":706,"h":162},{"id":"e4fc9a0bc5334568","type":"group","z":"1cf772ae2066495e","g":"95114553b51edb0e","name":"Succeeds","style":{"label":true},"nodes":["f8cd8013dad6a7e2","64b3488ed906c211","9dd05af5ce6443a9","b4f9e6b24c0651b3","211ed735c0cfa73f"],"x":334,"y":393,"w":778,"h":149.5},{"id":"6f3ef30b39769654","type":"split","z":"1cf772ae2066495e","g":"9566742be56e5253","name":"","splt":"\\n","spltType":"str","arraySplt":1,"arraySpltType":"len","stream":false,"addname":"","x":411,"y":215,"wires":[["d5b30c5a1123d50e"]]},{"id":"d5b30c5a1123d50e","type":"switch","z":"1cf772ae2066495e","g":"9566742be56e5253","name":"is not null","property":"payload","propertyType":"msg","rules":[{"t":"nnull"}],"checkall":"true","repair":false,"outputs":1,"x":511,"y":295,"wires":[["a66882716c7e581f"]]},{"id":"0a5eea257dc1fa82","type":"join","z":"1cf772ae2066495e","g":"9566742be56e5253","name":"","mode":"auto","build":"object","property":"payload","propertyType":"msg","key":"topic","joiner":"\\n","joinerType":"str","accumulate":"false","timeout":"","count":"","reduceRight":false,"x":760,"y":295,"wires":[["129e1f3418ce8fce"]]},{"id":"129e1f3418ce8fce","type":"debug","z":"1cf772ae2066495e","g":"9566742be56e5253","name":"no output","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"payload","targetType":"msg","statusVal":"","statusType":"auto","x":935,"y":295,"wires":[]},{"id":"f8cd8013dad6a7e2","type":"split","z":"1cf772ae2066495e","g":"e4fc9a0bc5334568","name":"","splt":"\\n","spltType":"str","arraySplt":1,"arraySpltType":"len","stream":false,"addname":"","x":429,"y":434,"wires":[["64b3488ed906c211"]]},{"id":"64b3488ed906c211","type":"switch","z":"1cf772ae2066495e","g":"e4fc9a0bc5334568","name":"is not null &amp; otherwise","property":"payload","propertyType":"msg","rules":[{"t":"nnull"},{"t":"else"}],"checkall":"true","repair":false,"outputs":2,"x":460,"y":495.5,"wires":[["211ed735c0cfa73f"],["9dd05af5ce6443a9"]]},{"id":"9dd05af5ce6443a9","type":"join","z":"1cf772ae2066495e","g":"e4fc9a0bc5334568","name":"","mode":"auto","build":"object","property":"payload","propertyType":"msg","key":"topic","joiner":"\\n","joinerType":"str","accumulate":"false","timeout":"","count":"","reduceRight":false,"x":854,"y":501.5,"wires":[["b4f9e6b24c0651b3"]]},{"id":"90aee4ed68c9b0d4","type":"inject","z":"1cf772ae2066495e","g":"95114553b51edb0e","name":"payload: [null,1,2]","props":[{"p":"payload"}],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","payload":"[null,1,2]","payloadType":"json","x":192,"y":330.5,"wires":[["f8cd8013dad6a7e2","6f3ef30b39769654"]]},{"id":"b4f9e6b24c0651b3","type":"debug","z":"1cf772ae2066495e","g":"e4fc9a0bc5334568","name":"original arrary","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"payload","targetType":"msg","statusVal":"","statusType":"auto","x":986,"y":434,"wires":[]},{"id":"a66882716c7e581f","type":"function","z":"1cf772ae2066495e","g":"9566742be56e5253","name":"... do something ...","func":"\nreturn msg;","outputs":1,"noerr":0,"initialize":"","finalize":"","libs":[],"x":643,"y":215,"wires":[["0a5eea257dc1fa82"]]},{"id":"211ed735c0cfa73f","type":"function","z":"1cf772ae2066495e","g":"e4fc9a0bc5334568","name":"... do something ...","func":"\nreturn msg;","outputs":1,"noerr":0,"initialize":"","finalize":"","libs":[],"x":681,"y":434,"wires":[["9dd05af5ce6443a9"]]}]
```

Becomes this:

![img](https://raw.githubusercontent.com/gorenje/flows.flowhub.org/main/1cf772ae2066495e/preview.png)

For more details, see this [blog page](https://blog.openmindmap.org/blog/backticks-in-markdown-and-node-red) with an example of embedding this into a [HTML page](https://blog.openmindmap.org/embed/example.html).


Source code is maintained in Node-RED, the [flows.json](flows.json) contains the flow that containts the code.

## Artifacts

- [GitHub repo](https://github.com/gorenje/node-red-flowviewer-js)
- [Flow that maintains this code](https://flowhub.org/f/3b1289d7ccf9cb0f)
- [Article](https://blog.openmindmap.org/blog/backticks-in-markdown-and-node-red)
- [JS library for browser](https://cdn.openmindmap.org/embed/flowviewer.js)