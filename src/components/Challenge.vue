<template>
  <div class="challenge">
    <div class="tooling" id="tooling">
      <label class="title">Kudy Challenge</label>
      <br />
      <b class="important"
        >N.B: For Triangle, pentagon and <br />
        hexagon, use the polygon shape and select <br />
        the correct number of sides</b
      >
      <form>
        <div v-if="selectedShape.name != ''" class="suggestions">
          <div v-if="selectedShape.length > 0">
            Did you mean:
            <label
              v-for="(shape, index) in selectedShape"
              :key="index"
              @click="selectSuggestion(shape.name)"
              >{{ shape.name }}</label
            >
          </div>
          <div v-else>
            No Shape Found
          </div>
        </div>
        <input
          type="text"
          placeholder="Enter your desired shape"
          v-model="model.shape"
          @input="getSuggestions(model.shape)"
        />
        <div v-for="(parameter, index) in getDimensionParameters" :key="index">
          <input
            :placeholder="`Enter a value for ${parameter.title}`"
            type="number"
            v-model="model.dimensions[index]"
          />
        </div>
        <div class="d-flex colors">
          <div
            :class="[model.color === color ? 'selected' : '', 'color']"
            @click="setColor(color)"
            :id="`${color}`"
            v-for="(color, i) in colors"
            :key="i"
            :style="`background-color: ${color}`"
          ></div>
        </div>
        <br />
        <span class="error" v-if="error.status">
          {{ error.msg }}
        </span>
        <br />
        <button
          id="create-shape"
          type="submit"
          @click.prevent="drawShape(model)"
        >
          Create Shape
        </button>
        <button class="error" @click.stop="clearStorage()">
          Clear Storage
        </button>
      </form>
    </div>

    <svg
      id="svg-renderer"
      ref="svgRenderer"
      xmlns="http://www.w3.org/2000/svg"
      :width="documentWidth"
      :height="documentHeight"
    ></svg>
  </div>
</template>

<script>
import {
  polygonCoordinateGenerator,
  generateCoordinates
} from '@/utils/generator';
import shapes from '@/data/shapes';
const selectedShapeDefault = {
  name: '',
  svgTag: '',
  type: '',
  parameters: []
};

export default {
  name: 'App',
  data() {
    return {
      svgWidth: 900,
      svgHeight: 900,
      documentHeight: 0,
      documentWidth: 0,
      error: {
        status: false,
        msg: ''
      },
      colors: ['#FFA726', '#26C6DA', '#7E57C2', '#66BB6A', '#FF5678'],
      codeColor: '#000000',
      selectedShape: selectedShapeDefault,
      model: {
        shape: '',
        dimensions: [],
        color: ''
      },
      storedShapes: []
    };
  },
  computed: {
    getDimensionParameters() {
      if (this.model.shape) {
        const shape = shapes.filter((shape) => shape.name === this.model.shape);
        return shape.length > 0
          ? shape[0].parameters
          : [{ title: 'length', svgAttribute: 'l' }];
      }
      return [{ title: 'length', svgAttribute: 'l' }];
    }
  },
  mounted() {
    const body = document.body,
      html = document.documentElement;

    this.documentHeight = Math.max(
      body.scrollHeight,
      body.offsetHeight,
      html.clientHeight,
      html.scrollHeight,
      html.offsetHeight
    );
    this.documentWidth = Math.max(
      body.scrollWidth,
      body.offsetWidth,
      html.clientWidth,
      html.scrollWidth,
      html.offsetWidth
    );

    const storedShapes = localStorage.getItem('stored-shapes');
    this.storedShapes = storedShapes ? JSON.parse(storedShapes) : [];
    this.storedShapes.map((shape) => this.drawShape(shape, true));
  },
  methods: {
    clearStorage() {
      localStorage.clear();
    },
    setColor(color) {
      const elems = document.querySelectorAll('.color');

      [].forEach.call(elems, (el) => {
        el.classList.remove('active-color');
      });

      this.model.color = color;
      const el = document.getElementById(color);
      if (el) {
        el.classList.add('active-color');
      }
    },
    selectSuggestion(selectionName) {
      this.model.shape = selectionName;
      this.selectedShape = selectedShapeDefault;
    },
    getSuggestions(type) {
      this.selectedShape = type
        ? shapes.filter((shape) =>
            shape.name.toLowerCase().includes(type.toLowerCase())
          )
        : selectedShapeDefault;
      this.model.dimensions = [];
    },
    drawShape(model, isFromStore) {
      const inputedShape = model.shape;
      const inputedDimensions = model.dimensions;

      const shapeObj = shapes.find(
        (shape) => shape.name.toLowerCase() === inputedShape.toLowerCase()
      );

      if (shapeObj) {
        let svgNamespace = 'http://www.w3.org/2000/svg';
        const createdShape = document.createElementNS(
          svgNamespace,
          shapeObj.svgTag
        );
        if (
          shapeObj.name.toLowerCase() === 'square' &&
          inputedDimensions[0] != inputedDimensions[1]
        ) {
          this.displayError('A square must have equal sides');
          return;
        } else if (shapeObj.name.toLowerCase() !== 'polygon') {
          shapeObj.parameters.map((parameter, index) => {
            createdShape.setAttribute(
              parameter.svgAttribute,
              inputedDimensions[index]
            );
          });
          const coordinates = generateCoordinates(
            this.documentHeight,
            this.documentWidth,
            {
              width: inputedDimensions[0],
              height: inputedDimensions[1]
            }
          );
          if (shapeObj.svgTag === 'rect') {
            createdShape.setAttribute('x', coordinates[0]);
            createdShape.setAttribute('y', coordinates[1]);
          } else {
            createdShape.setAttribute('cx', coordinates[0]);
            createdShape.setAttribute('cy', coordinates[1]);
          }
          createdShape.style.fill = model.color;
        } else if (
          shapeObj.name.toLowerCase() === 'polygon' &&
          Number(model.dimensions[0]) === 4
        ) {
          return this.displayError(
            'Use the square shape Type instead of a polygon with 4 sides'
          );
        } else {
          if (Number(model.dimensions[0]) > 5)
            return this.displayError(
              'Only polygons with sides 3 and 5 supported'
            );
          const points = polygonCoordinateGenerator(
            this.documentWidth,
            this.documentHeight,
            createdShape,
            model.dimensions[0]
          );
          createdShape.setAttribute('points', points);
          createdShape.setAttribute('style', `fill:${model.color} !important;`);
        }
        createdShape.setAttribute('class', 'rubberBand');
        this.$refs.svgRenderer.appendChild(createdShape);

        if (!isFromStore) {
          this.storedShapes.push(model);
          localStorage.setItem(
            'stored-shapes',
            JSON.stringify(this.storedShapes)
          );
        }
      } else {
        this.displayError('no shape found');
      }
    },
    displayError(msg) {
      this.error.status = true;
      this.error.msg = msg;
    }
  }
};
</script>

<style>
:root {
  --animate-duration: 1s;
  --animate-delay: 1s;
  --animate-repeat: 1;
}
body {
  margin: 0 !important;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
.title {
  color: #fff;
}

.input-label {
  font-size: 16px !important;
  color: #747474;
}
.important {
  margin: 15px 0 !important;
  color: rgb(209, 228, 42);
}
input {
  background: #f2f3fc;
  border-radius: 5px;
  border: none;
  padding-left: 10px;
  box-sizing: border-box;
  border-radius: 8px;
  width: 200px;
  margin-top: 10px;
  height: 45px;
}
input::placeholder {
  font-style: normal;
  font-weight: normal;
  font-size: 12px;
  line-height: 15px;
}
input:hover,
input:focus {
  border: 1px solid #6246ea;
  outline: none;
}
.suggestions label {
  margin-left: 20px;
  color: blue;
  cursor: pointer;
  text-decoration: underline;
}
.colors {
  margin-top: 20px !important;
}
.colors .color {
  height: 30px;
  width: 30px;
  border-radius: 50%;
  margin: 0 10px;
  cursor: pointer;
}
.color.selected,
.color:hover {
  border: 2px solid #000;
}
.d-flex {
  display: flex;
}
button {
  padding: 9px;
  background: #41c489;
  color: #fff;
  border: none;
  margin: 0 5px;
}
button:focus {
  outline: none;
}
span.error {
  color: #b71c1c;
}
button.error {
  background: #b71c1c;
}
/* svg {
  max-width: 1080px !important;
  background: green;
  max-height: 760px !important;
} */
#tooling {
  position: fixed;
  background: rgba(0, 0, 0, 0.4);
  right: 0;
  bottom: 0;
  padding: 2em;
}

@-webkit-keyframes rubberBand {
  from {
    -webkit-transform: scale3d(1, 1, 1);
    transform: scale3d(1, 1, 1);
  }

  30% {
    -webkit-transform: scale3d(1.25, 0.75, 1);
    transform: scale3d(1.25, 0.75, 1);
  }

  40% {
    -webkit-transform: scale3d(0.75, 1.25, 1);
    transform: scale3d(0.75, 1.25, 1);
  }

  50% {
    -webkit-transform: scale3d(1.15, 0.85, 1);
    transform: scale3d(1.15, 0.85, 1);
  }

  65% {
    -webkit-transform: scale3d(0.95, 1.05, 1);
    transform: scale3d(0.95, 1.05, 1);
  }

  75% {
    -webkit-transform: scale3d(1.05, 0.95, 1);
    transform: scale3d(1.05, 0.95, 1);
  }

  to {
    -webkit-transform: scale3d(1, 1, 1);
    transform: scale3d(1, 1, 1);
  }
}
@keyframes rubberBand {
  from {
    -webkit-transform: scale3d(1, 1, 1);
    transform: scale3d(1, 1, 1);
  }

  30% {
    -webkit-transform: scale3d(1.25, 0.75, 1);
    transform: scale3d(1.25, 0.75, 1);
  }

  40% {
    -webkit-transform: scale3d(0.75, 1.25, 1);
    transform: scale3d(0.75, 1.25, 1);
  }

  50% {
    -webkit-transform: scale3d(1.15, 0.85, 1);
    transform: scale3d(1.15, 0.85, 1);
  }

  65% {
    -webkit-transform: scale3d(0.95, 1.05, 1);
    transform: scale3d(0.95, 1.05, 1);
  }

  75% {
    -webkit-transform: scale3d(1.05, 0.95, 1);
    transform: scale3d(1.05, 0.95, 1);
  }

  to {
    -webkit-transform: scale3d(1, 1, 1);
    transform: scale3d(1, 1, 1);
  }
}
.rubberBand {
  -webkit-animation-duration: 1s;
  animation-duration: 1s;
  -webkit-animation-duration: var(--animate-duration);
  animation-duration: var(--animate-duration);
  -webkit-animation-fill-mode: both;
  animation-fill-mode: both;
  -webkit-animation-name: rubberBand;
  animation-name: rubberBand;
}
</style>
