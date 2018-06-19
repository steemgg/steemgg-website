<template>
  <div class="swiper-container">
    <swiper :options="swiperOption" ref="mySwiper">
      <swiper-slide><img class="slider-image" src="https://ui-resource.steemgg.com/image/cover/cover-1.gif"/></swiper-slide>
      <swiper-slide><img class="slider-image" src="https://ui-resource.steemgg.com/image/cover/cover-2.gif"/></swiper-slide>
      <swiper-slide><img class="slider-image" src="https://ui-resource.steemgg.com/image/cover/cover-3.gif"/></swiper-slide>
      <swiper-slide><img class="slider-image" src="https://ui-resource.steemgg.com/image/cover/cover-4.gif"/></swiper-slide>
      <swiper-slide><img class="slider-image" src="https://ui-resource.steemgg.com/image/cover/cover-5.gif"/></swiper-slide>
      <div class="swiper-pagination" slot="pagination"></div>
    </swiper>
  </div>
</template>

<script>
  import { swiper, swiperSlide } from 'vue-awesome-swiper'

  export default {
    components: {
      swiper,
      swiperSlide
    },
    name: 'GameSlider',
    data () {
      return {
        swiperOption: {
          autoplay: 3000,
          pagination: '.swiper-pagination',
          paginationClickable: true
        }
      }
    },
    // you can find current swiper instance object like this, while the notNextTick property value must be truecomputed: {
      swiper () {
        return this.$refs.mySwiper.swiper
      }
    },
    mounted () {
      // you can use current swiper instance object to do something(swiper methods)
      // 然后你就可以使用当前上下文内的swiper对象去做你想做的事了
      console.log('this is current swiper instance object', this.swiper)
      this.swiper.slideTo(3, 1000, false)
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
  @import '../../../node_modules/swiper/dist/css/swiper.css';
  .slider-image {
    width:100%;
    height:100%;
  }
  .swiper-container {
    height: 500px;
    position: relative;
  }
  .slider-text {
    position: absolute;
    top: 30%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 100;
  }

  .slider-text{
    padding-top: 11em;
    margin: 0 auto;
    text-align: center;
  }
  .slider-text h3 {
    text-align: center;
    font-size: 3.5em;
    color: #fff;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 4px;
  }
  .slider-text h3 span {
    color:#02a388;
  }
  .slider-text h4{
    text-align: center;
    font-size: 1em;
    color: #fff;
    margin: 2em 0 2.5em 0;
    font-family: 'Lato', sans-serif;
    text-transform: uppercase;
    font-weight: 300;
    letter-spacing: 5px;
  }
</style>
