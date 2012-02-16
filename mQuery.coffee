class mQuery
  
  constructor: (obj) ->
    if obj is window
      return new mQuery(obj)

    type = typeof obj

    if type is "string"
      @el = document.getElementById(obj)
    else if type is "object" and obj.nodeType isnt "undefined" and obj.nodeType is 1
      @el = obj
    else
      throw new Error("Invalid Argument")

  addEvent: (evt,fn) ->
    mQuery.addEvent(@el, evt, fn)
    @

  removeEvent: (evt,fn) ->
    mQuery.removeEvent(@el, evt, fn)
    @

  click: (fn) ->
    that = @
    mQuery.addEvent @el, "click", (e) ->
      fn.call that, e
    @

  mouseout: (fn) ->
    that = @
    mQuery.addEvent @el, "mouseout", (e) ->
      fn.call that, e
    @

  mouseover: (fn) ->
    that = @
    mQuery.addEvent @el, "mouseover", (e) ->
      fn.call that, e
    @

  css = (css, value) ->
    mQuery.css(@el, css, value) or @

  addClass = (value) ->
    mQuery.addClass @el, value
    @

  removeClass = (value) ->
    mQuery.removeClass @el, value
    @

  toggleClass = (value) ->
    mQuery.toggleClass @el, value
    @

  hasClass = (value) ->
    mQuery.hasClass @el, value  

  append = (data) ->
    if typeof data.nodeType isnt "undefined" and data.nodeType is 1
      @el.appendChild data
    else if data instanceof mQuery
      @el.appendChild data.el
    else if typeof data is "string"
      html = @el.innerHTML
      @el.innerHTML = html + data
    this

  html = (html) ->
    if typeof html isnt "undefined"
      @el.innerHTML = html
      this
    else
      @el.innerHTML    
  
  if typeof addEventListener isnt "undefined"
    mQuery.addEvent = (obj, evt, fn) ->
      obj.addEventListener evt, fn, false

    mQuery.removeEvent = (obj, evt, fn) ->
      obj.removeEventListener evt, fn, false
  
  else if typeof attachEvent isnt "undefined"
    mQuery.addEvent = (obj, evt, fn) ->
      fnHash = "e_" + evt + fn
      obj[fnHash] = ->
        type = event.type
        relatedTarget = null
        relatedTarget = (if (type is "mouseover") then event.fromElement else event.toElement)  if type is "mouseover" or type is "mouseout"
        fn.call obj,
          target: event.srcElement
          type: type
          relatedTarget: relatedTarget
          _event: event
          preventDefault: ->
            @_event.returnValue = false

          stopPropagation: ->
            @_event.cancelBubble = true

      obj.attachEvent "on" + evt, obj[fnHash]

    mQuery.removeEvent = (obj, evt, fn) ->
      fnHash = "e_" + evt + fn
      if typeof obj[fnHash] isnt "undefined"
        obj.detachEvent "on" + evt, obj[fnHash]
        delete obj[fnHash]
  else
    mQuery.addEvent = (obj, evt, fn) ->
      obj["on" + evt] = fn

    mQuery.removeEvent = (obj, evt, fn) ->
      obj["on" + evt] = null
  
  mQuery.css = (el, css, value) ->
    cssType = typeof css
    valueType = typeof value
    elStyle = el.style
    if cssType isnt "undefined" and valueType is "undefined"
      if cssType is "object"
        for prop of css
          elStyle[toCamelCase(prop)] = css[prop]  if css.hasOwnProperty(prop)
      else if cssType is "string"
        getStyle el, css
      else
        throw message: "Invalid parameter passed to css()"
    else if cssType is "string" and valueType is "string"
      elStyle[toCamelCase(css)] = value
    else
      throw message: "Invalid parameters passed to css()"
  
  mQuery.hasClass = (el, value) ->
    (" " + el.className + " ").indexOf(" " + value + " ") > -1

  mQuery.addClass = (el, value) ->
    className = el.className
    unless className
      el.className = value
    else
      classNames = value.split(/\s+/)
      l = classNames.length
      i = 0
  
      while i < l
        className += " " + classNames[i]  unless @hasClass(el, classNames[i])
        i++
      el.className = className.trim()
    
  mQuery.removeClass = (el, value) ->
    if value
      classNames = value.split(/\s+/)
      className = " " + el.className + " "
      l = classNames.length
      i = 0
  
      while i < l
        className = className.replace(" " + classNames[i] + " ", " ")
        i++
      el.className = className.trim()
    else
      el.className = ""
  
  mQuery.toggleClass = (el, value) ->
    classNames = value.split(/\s+/)
    i = 0
    className = undefined
    this[(if @hasClass(el, className) then "removeClass" else "addClass")] el, className  while className = classNames[i++]  

  mQuery.createElement = (obj) ->
    throw message: "Invalid argument"  if not obj or not obj.tagName
    el = document.createElement(obj.tagName)
    obj.id and (el.id = obj.id)
    obj.className and (el.className = obj.className)
    obj.html and (el.innerHTML = obj.html)
    if typeof obj.attributes isnt "undefined"
      attr = obj.attributes
      prop = undefined
      for prop of attr
        el.setAttribute prop, attr[prop]  if attr.hasOwnProperty(prop)
    if typeof obj.children isnt "undefined"
      child = undefined
      i = 0
      el.appendChild @createElement(child)  while child = obj.children[i++]
    el

toCamelCase = (str) ->
  str.replace /-([a-z])/g, (all, letter) ->
    letter.toUpperCase()

getStyle = (->
  if typeof getComputedStyle isnt "undefined"
    (el, cssProp) ->
      window.getComputedStyle(el, null).getPropertyValue cssProp
  else
    (el, cssProp) ->
      el.currentStyle[toCamelCase(cssProp)]
)()

if typeof String::trim is "undefined"
  String::trim = ->
    @replace(/^\s+/, "").replace /\s+$/, ""    