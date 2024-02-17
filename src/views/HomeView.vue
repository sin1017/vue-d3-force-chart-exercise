<script setup lang="ts">
import * as d3 from "d3";
import { values } from "d3-collection";
const props = withDefaults(
  defineProps<{
    data: {
      nodeList: {
        id: number;
        name: string;
      }[];
      lineData: {
        id: number;
        source: number;
        target: number;
        relation: string;
        value: number;
      }[];
    };
    width?: string;
    height?: string;
    strokeWidth?: string;
    colorPicker?: boolean;
    transition?: boolean;
    tooltip?: boolean;
  }>(),
  {}
);
const svg = ref();
const width = computed(() => svg.value.attr("width"));
const height = computed(() => svg.value.attr("height"));
const title = ref();
const nodesMap = ref();
const nodesDataList = ref();
const linkMap = ref();
const edges = ref();
const colorScale = ref();
const forceSimulation = ref();
const mark = ref();
const links = ref();
const lineText = ref();
const g = ref();
const gs = ref();
const xScale = computed(() => {});
const yScale = computed(() => {});
const path = computed(() => {});

/**
 * @description 生成node map
 * @returns {NodeMap} {object Key:number:{id:number,name:string}}
 */
function genNodesMap(nodesList: any) {
  return nodesList.reduce(
    (result: any, item: { id: number; name: string; color: string }) => {
      result[item.id] = {
        id: item.id,
        name: item.name,
        color: item.color,
      };
      return result;
    },
    {}
  );
}
/**
 * @description 建立link map
 */
function genLinkMap(relations: any) {
  return relations.reduce((result: any, item: any) => {
    const key = item.source + "-" + item.target;
    if (result[key]) {
      result[key] += 1;
      result[key + "-relation"] += "、" + relations;
    } else {
      result[key] = 1;
      result[key + "-relation"] = relations;
    }
    return result;
  }, {});
}
/**
 * @description 生成線數據
 * @param relations
 */
function genLinkList(relations: any) {
  const indexHash = {};
  return relations.map(({ id, source, target, relation, value }: any, index: number) => {
    const linkKey = source + "-" + target;
    const count = linkMap.value[linkKey];
    if (indexHash[linkKey]) {
      indexHash[linkKey] -= 1;
    } else {
      indexHash[linkKey] = count - 1;
    }
    return {
      id,
      source: nodesMap.value[source],
      target: nodesMap.value[target],
      relation,
      value,
      relations: linkMap.value[linkKey + "-relation"],
      count: linkMap.value[linkKey],
      index: indexHash[linkKey],
    };
  });
  // return relations.reduce((result: any, item: any) => {}, {});
}
/**
 * @description 移除彈窗
 */
function removeSingle() {
  d3.select(".singleCircle").remove();
}
/**
 * @description 生成關係連線路徑
 */
function genLinkPath(link: any) {
  const sx = link.source.x;
  const tx = link.target.x;
  const sy = link.source.y;
  const ty = link.target.y;
  return "M" + sx + "," + sy + "L" + tx + "," + ty;
}
/**
 * @description 線上的文字
 */
function toggleLineText(currNode: any, isHover: boolean) {
  if (isHover) {
    lineText.value.style("fill-opacity", function (edge: any) {
      if (edge.source === currNode) {
        return 1;
      }
    });
  } else {
    lineText.value.style("fill-opacity", function (edge: any) {
      if (edge.source === currNode || edge.target === currNode) {
        return 0;
      }
    });
  }
}
/**
 * @description hover 連線加重樣式
 */
function toggleLine(linkLine: any, currNode: any, isHover: boolean) {
  if (isHover) {
    //加重連線樣式
    links.value
      .style("opacity", 0.1)
      .filter((link: any) => currNode.id === link.id)
      .style("opacity", 1)
      .classed("link-active", true);
  } else {
    links.value.style("opacity", 1).classed("link-active", false);
  }
}
function isLinkNode(currNode: any, node: any) {
  if (currNode.id === node.id) {
    return true;
  }
  return (
    linkMap.value[currNode.id + "-" + node.id] ||
    linkMap.value[node.id + "-" + currNode.id]
  );
}
function toggleNode(nodeCircle: any, currNode: any, isHover: boolean) {
  if (isHover) {
    //提升節點層級
    nodeCircle
      .style("opacity", 0.1)
      .filter((node: any) => isLinkNode(currNode, node))
      .style("opacity", 1);
  } else {
    nodeCircle.style("opacity", 1);
  }
}
function toggleCircle(current: any, d: any) {
  let currentD = d;
  if (d.clickFlag) {
    removeSingle();
  }
  d.clickFlag = true;
  const data = [
    {
      population: 30,
      value: "X",
      type: "delete",
    },
    {
      population: 30,
      value: "收起",
      type: "showOn",
    },
    {
      population: 30,
      value: "展开",
      type: "showOff",
    },
    {
      population: 30,
      value: "添加",
      type: "addNewNode",
    },
  ];

  //-------------------------------------------------
  const sum = d3.sum(
    data.map(function (d) {
      return d.population;
    })
  );
  for (const i in data) {
    data[i].Percentage = ((data[i].population / sum) * 100).toFixed(0) + "%";
  }
  const width = 300,
    height = 300;
  const g = current
    .append("g")
    .attr("class", "singleCircle")
    .attr("width", width)
    .attr("height", height);
  const Pie = g.append("g");

  const arc_generator = d3
    .arc()
    .innerRadius(width / 6.5)
    .outerRadius(width / 4);
  const angle_data = d3.pie().value(function (d) {
    return d.population;
  });
  const pieData = angle_data(data);
  const pieAngle = pieData.map(function (p) {
    return ((p.startAngle + p.endAngle) / 2 / Math.PI) * 180;
  });

  // 生成内部圆环
  Pie.selectAll("path")
    .data(angle_data(data))
    .enter()
    .append("path")
    .attr("d", arc_generator)
    .style("fill", function (d: any, i: any) {
      return "grey";
    })
    .style("stroke", "black")
    .attr("class", "path")
    .attr("type", function (d: any) {
      return d.data.type;
    })
    .on("click", function (d: any) {
      if (d.data.type === "delete") {
        // deleteNode(currentD);
        console.log("刪除");
      }
      if (d.data.type === "showOn") {
        // deleteNextNodes(currentD);
        console.log("收起");
      }
      if (d.data.type === "addNewNode") {
        // choseNodeValue = d;
        console.log("新增");
      }
      // d3.event.stopPropagation();
    });
  const arc_label = d3
    .arc()
    .innerRadius(width / 4)
    .outerRadius(width / 2);

  Pie.selectAll(".arc_label")
    .data(angle_data(data))
    .enter()
    .append("path")
    .attr("d", arc_label)
    .attr("class", "arc_label")
    .style("fill", "none");
  const labelFontSize = 12;
  const labelValRadius = 170 * 0.35 - labelFontSize * 0.35; // 计算正确半径 文字位置
  const labelValRadius1 = 170 * 0.35 + labelFontSize * 0.35;

  const labelsVals = current
    .select(".singleCircle")
    .append("g")
    .classed("labelsvals", true);

  // 定义两条路径以使标签的方向正确
  labelsVals
    .append("def")
    .append("path")
    .attr("id", "label-path-1")
    .attr(
      "d",
      `m0 ${-labelValRadius} a${labelValRadius} ${labelValRadius} 0 1,1 -0.01 0`
    );
  labelsVals
    .append("def")
    .append("path")
    .attr("id", "label-path-2")
    .attr(
      "d",
      `m0 ${-labelValRadius1} a${labelValRadius1} ${labelValRadius1} 0 1,0 0.01 0`
    );

  labelsVals
    .selectAll("text")
    .data(data)
    .enter()
    .append("text")
    .style("font-size", labelFontSize)
    .style("fill", "black")
    .style("font-weight", "bold")
    .style("text-anchor", "middle")
    .append("textPath")
    .attr("href", function (d: any, i: number) {
      const p = pieData[i];
      const angle = pieAngle[i];
      if (angle > 90 && angle <= 270) {
        // 根据角度选择路径
        return "#label-path-2";
      } else {
        return "#label-path-1";
      }
    })
    .attr("startOffset", function (d: any, i: number) {
      const p = pieData[i];
      const angle = pieAngle[i];
      let percent = ((p.startAngle + p.endAngle) / 2 / 2 / Math.PI) * 100;
      if (angle > 90 && angle <= 270) {
        // 分别计算每条路径的正确百分比
        return 100 - percent + "%";
      }
      return percent + "%";
    })
    .text((d: any) => d.value)
    .on(
      "click",
      function (event: any, d: any) {
        console.log("event 111", event);
        console.log("ddd===", d);

        if (d.type === "delete") {
          // deleteNode(currentD);
        }
        if (d.type === "showOn") {
          // deleteNextNodes(currentD);
        }
        if (d.type === "showOff") {
          // showMyList();
        }
        if (d.type === "addNewNode") {
          // choseNodeValue = d;
        }
        // d3.event.stopPropagation();
      },
      true
    );
}

function started(event: any, d: any) {
  if (!event?.active) {
    forceSimulation.value.alphaTarget(0.8).restart(); // 设置衰减系数，对节点位置移动过程的模拟，数值越高移动越快，数值范围[0, 1]
  }
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(event: any, d: any) {
  d.fx = event.x;
  d.fy = event.y;
}
function ended(event: any, d: any) {
  if (!event?.active) {
    forceSimulation.value.alphaTarget(0);
  }
  d.fx = null;
  d.fy = null;
}
/**
 * @description 節點寫入文字、換行處理
 */
function textBreaking(d3text: any, text: string) {
  const len = text.length;
  if (len <= 3) {
    d3text.append("tspan").attr("x", 0).attr("y", -3).text(text);
  } else {
    const topText = text.substring(0, 3);
    const midText = text.substring(3, 7);
    let botText = text.substring(7, len);
    let topY = -22;
    let midY = 8;
    let botY = 34;
    if (len <= 9) {
      topY += 10;
      midY += 10;
    } else {
      botText = text.substring(7, 9) + "...";
    }
    d3text.text("");
    d3text
      .append("tspan")
      .attr("x", 0)
      .attr("y", topY)
      .text(function () {
        return topText;
      });
    d3text
      .append("tspan")
      .attr("x", 0)
      .attr("y", midY)
      .text(function () {
        return midText;
      });
    d3text
      .append("tspan")
      .attr("x", 0)
      .attr("y", botY - 7)
      .text(function () {
        return botText;
      });
  }
}

/**
 * @description ticked
 */
function ticked() {
  // 節點間的連線，定位
  links.value
    .attr("d", (link: any) => genLinkPath(link))
    .on("click", function () {
      console.log("tick");
    });
  // 線上hover 文字顯示位置
  lineText.value
    .attr("x", function (d: any) {
      return (d.source.x + d.target.x) / 2;
    })
    .attr("y", function (d: any) {
      return (d.source.y + d.target.y) / 2;
    });
  // 节点位置
  gs.value.attr("transform", function (d: any) {
    return "translate(" + d.x + "," + d.y + ")";
  });
}

/**
 * @description 繪製圖表
 */
function drawChart() {
  g.value = svg.value.append("g").attr("class", "container");
  nodesMap.value = genNodesMap(props.data.nodeList);
  nodesDataList.value = values(nodesMap.value);
  linkMap.value = genLinkMap(props.data.lineData);
  edges.value = genLinkList(props.data.lineData);

  colorScale.value = d3
    .scaleOrdinal()
    .domain(d3.range(nodesDataList.value.length))
    .range(d3.schemeCategory10);
  // 建立力導向圖
  forceSimulation.value = d3
    .forceSimulation()
    .force("link", d3.forceLink())
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter());
  // 生成節點數據
  forceSimulation.value.nodes(nodesDataList.value);
  // 生成邊數據
  forceSimulation.value
    .force("link")
    .links(edges.value)
    .distance((d: any) => {
      return d.value * 150;
    });
  // 設置圖形中心位置
  forceSimulation.value
    .force("center")
    .x(width.value / 2)
    .y(height.value / 2);
  mark.value = g.value
    .append("g")
    .attr("class", "showLine")
    .append("marker")
    .attr("id", "resolved")
    .attr("markerUnits", "strokeWidth") //設置 strokeWidth 箭頭會隨著線的粗細變化
    .attr("markerUnits", "userSpaceOnUse")
    .attr("viewBox", "0 -5 10 10") //座標系的區域
    .attr("refX", 44) //箭頭座標
    .attr("refY", 0)
    .attr("markerWidth", 20) //箭頭大小
    .attr("markerHeight", 10)
    .attr("orient", "auto") //繪製方向，可設定為：auto(自動確認方向)和 角度值
    .attr("stroke-width", 2)
    .append("path")
    .attr("d", "M0,-5L10,0L0,5") //箭頭的路徑
    .attr("fill", "#000000"); //箭頭顏色
  links.value = g.value
    .append("g")
    .selectAll("path")
    .data(edges.value)
    .enter()
    .append("path")
    .attr("d", (link: any) => genLinkPath(link)) //遍歷所有數據。d表示當前遍歷到的數據，返回繪製的貝爾賽曲線(把節點和節點中間話上線)
    .attr("id", (d: any, i: number) => {
      //設置id，用於連線文字
      return "edgepath" + d.id;
    })
    .style("stroke", "#000") //顏色
    .style("stroke-width", 2) //粗細
    .attr("class", "lines")
    .attr("marker-end", "url(#resolved)")
    .each(() => {
      //在此綁定事件
      d3.select(this).on("click", () => {
        console.log("i");
      });
    }); //根據箭頭標記的id標記箭頭
  lineText.value = g.value
    .append("g")
    .selectAll("text")
    .data(edges.value)
    .enter()
    .append("text")
    .attr("class", "linksText")
    .text((d: any) => d.relation)
    .style("font-size", 14)
    .attr("fill-opacity", 0);
  //創建分組
  gs.value = g.value
    .append("g")
    .selectAll(".circleText")
    .data(nodesDataList.value)
    .enter()
    .append("g")
    .attr("class", "singleNode")
    .attr("id", (d: any) => "singleNode" + d.id)
    .style("cursor", "pointer")
    .attr("transform", (d: any) => {
      const cirX = d.x;
      const cirY = d.y;
      return "translate(" + cirX + "," + cirY + ")";
    });

  //mouse event
  gs.value
    .on("mouseover", function (d: HTMLElementEventMap, i: {}) {
      // 顯示線上的文字
      toggleLineText(i, true);
      toggleLine(links.value, i, true);
      toggleNode(gs.value, i, true);
    })
    .on("mouseout", function (d: any, i: number) {
      // 隱藏線上的文字
      toggleLineText(d, false);
      toggleLine(links.value, d, false);
      toggleNode(gs.value, d, false);
    })
    .on(
      "click",
      function (d: any, i: number) {
        lineText.value.style("fill-opacity", (edge: any) => {
          if (edge.source === i) {
            return 1;
          }
        });
        toggleCircle(d3.select(this), i);
      },
      true
    )
    .call(d3.drag().on("start", started).on("drag", dragged).on("end", ended));
  svg.value.on(
    "click",
    function () {
      nodesDataList.value.forEach((d: any) => (d.clickFlag = false));
      removeSingle();
    },
    true
  );
  //節點連線
  forceSimulation.value.on("tick", ticked);
  //繪製節點
  gs.value
    .append("circle")
    .attr("r", 35)
    .attr("id", (d: any) => {
      return "circle" + d.id;
    })
    .attr("fill", (d: any, i: number) => d.color)
    .attr("stroke", "grey")
    .attr("stroke-width", 3);
  // 文字內容
  gs.value
    .append("text")
    .attr("y", -20)
    .attr("dy", 10)
    .attr("text-anchor", "middle")
    .style("font-size", 12)
    .attr("x", function ({ name }: any) {
      return textBreaking(d3.select(this), name);
    });
}
onMounted(() => {
  svg.value = d3.select("svg");
  drawChart();
  // 滑鼠滾輪控制放大縮小
  svg.value.call(
    d3.zoom().on("zoom", function (d, i) {
      g.value.attr("transform", d.transform);
    })
  );
  const zoomT = d3.zoom().on("zoom", (d) => g.value.attr("transform", d.transform));
  svg.value.call(zoomT);
  // 按鈕控制svg 放大 縮小
  d3.select("#zoom-in").on("click", (d, i) => {
    svg.value.transition().call(zoomT.scaleBy, 1.2);
  });
  d3.select("#zoom-out").on("click", (d, i) => {
    svg.value.transition().call(zoomT.scaleBy, 0.8);
  });
});
</script>

<template>
  <div>
    <h3>{{ title }}</h3>
    <svg
      class="draw"
      width="960"
      height="500"
      viewBox="0 0 960 500"
      preserveAspectRatio="xMinYMin"
    ></svg>
  </div>
  <div>
    <button id="zoom-in" class="mx-5">放大</button>
    <button id="zoom-out">縮小</button>
  </div>
</template>
<style>
.link-active {
  stroke-opacity: 1;
  stroke-width: 3;
}
.draw {
  width: 80%;
  height: 600px;
  border: solid 1px blue;
}
.dialog {
  width: 300px;
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-left: 20px;
}
.inputBox {
  display: flex;
  margin-bottom: 20px;
}
</style>
