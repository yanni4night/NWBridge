/**
  * Copyright (C) 2015~2016 yanni4night.com
  * asap.js
  *
  * changelog
  * 2015-11-22[22:08:44]:revised
  *
  * @author yanni4night@gmail.com
  * @version 1.0.0
  * @since 1.0.0
  */
 
const hasSetImmediate = typeof setImmediate === "function";
 
export function asap(task) {
    return hasSetImmediate ? setImmediate(task) : setTimeout(task);
}
