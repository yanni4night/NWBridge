/**
  * Copyright (C) 2015 tieba.baidu.com
  * promise.js
  *
  * changelog
  * 2015-11-19[14:17:36]:revised
  *
  * @author yinyong02@baidu.com
  * @version 0.1.0
  * @since 0.1.0
  */
export function Promise(func){
  return new window.Promise(func);
};