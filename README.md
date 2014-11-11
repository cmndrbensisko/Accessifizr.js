Accessifizr 0.9b
==

Accessifizr is a Dojo plugin intended to quickly make web applications tab navigable and compliant with AODA/Section 508 accessibility standards without having to massively modify core application code and UI.  Originally developed for use with ESRI Javascript Templates, additional functionality is planned to be rolled into the application with future releases.

Basic Usage
--

The current release of Accessifizr is Dojo-powered, so if your application does not currently use the dojo package, it will still need to be imported into your application to use the plugin.  Accessifizr can be quickly loaded into an application as a normal Dojo module, and initiated within your code with a few startup parameters.

<pre>
		<script type="text/javascript">
			require(["js/Accessifizr-0.9","dojo/text!js/handlebars.json", "dojo/domReady!"], function(Accessifizr, data) {
				Accessifizr.init({"data": data});
			});
		</script>
</pre>

handlebars.json
--

Note that in the initialization example above, a .json file is passed into the module as the 'data' parameter.  The handlebars.json file should contain a valid json object representing a 'roadmap' of your application's UI interface.

Accessifizr will override any inline tabIndex values present in your HTML.

It is responsible for outlining the default Tab Navigation of your application, and detailing how the Navigation should change as users interact with the page.  In the following code sample, note the top-level "tabOrder" key, and the use of CSS selectors to uniquely identify page elements that should recieve a TabIndex value on domReady.

### Example #1:

<pre>
    {"tabOrder":
        {"objects":
            [  
                {  
                "id":"#firstControl",
                <b>"tab":1</b>
    			},
    			{  
    				"id":"#secondControl",
    				<b>"tab":2</b>
    			}
    		]
       }
    }
</pre>

The above example will, on domReady!, apply a tabIndex of 1 to a control with the id "firstControl", and a tabIndex of 2 to a control with the id "secondControl".  

Page Elements are deferred, meaning that you can specify rules for page elements that may not have completely loaded into the DOM yet.  As soon as a specified element shows up in the DOM, Accessifizr should apply the appropriate Handlebars rule to the element, and stop listening for its arrival.  NOTE: Referencing page controls which never appear in the DOM can lead to redundant listeners and memory leaks.

### Example #2:

<pre>
    {"tabOrder":
        {"objects":
            [  
                {  
                    "id":"#firstControl",
                    "tab":1,
                    <b>"clickModes":"click,keyup[13|32]",
                    "onClick":{  
                        "objects": 
                            [  
                                {  
                                    "id":"#thirdControl",
                                    "tab":3
                                }
                            ]
                        }</b>
                },
                {  
                    "id":"#secondControl",
                    "tab":2
                }
            ]
        }
    }
</pre>

Typically, if created without the intention of keyboard accessibility, an application's elements will be activated via 'click' events.  The 'onClick' property tells Accessifizr what to do when a page element is interacted with by a user.  It must be paired with the "clickModes" property, which tells Accessifizr which events should be interpreted as the element being 'clicked'.  

In the above example, both a 'click' event and a 'keyup' event on the firstControl element will be interpreted by Accessifizr as a click.  The bar-delineated list next to 'keyup' corresponds to the keycodes that should be interpreted as a valid keyup event.  

In this case, a mouse click, a keyup event on the Enter key (keycode 13), or a keyup event on the Spacebar (keycode 32) will result in a page element with the id "thirdControl" being added to the page's Tab Navigation Order with an Tab Index value of 3.  This would correspond, for instance, to clicking an "OK" button in a modal dialog, resulting in the closing of the dialog box and new dynamic page content being loaded.

Event Delegation:
--

Occasionally, you may not want events on one page element to activate any functionality on that particular element, and it would be more suitable to execute an event on another control instead.  The "clickModes" property can optionally be paired with two parameters that can further detail how the event will be interpreted by Accessifizr:

1)	A "clickControl" property tells Accessifizr which control to dispatch an event to when one of the specified clickModes is detected.  This defaults to the focused element itself, but it can be delegated to another object as well.  It must be paired with the following property:

2)	A "clickControlEvt" tells Accessifizr what type of event to dispatch to the control specified in clickControl.  This defaults to 'click'.

A business case for this would be when you have an input field and a separate button that activates a search, and you want an enter event in the input field to execute the search.  In this case, you would set up the input field object as follows in your handlebars file.  Note the empty "onClick" property, as all onClick events would actually be handled by the delegated clickControl.

<pre>
    {
        "id":"#inputField",
        <b>"clickModes":"keyup[13]",
        "clickControl":"#searchButton",
        "clickControlEvt":"click",</b>
        "tab":1,
        "onClick":{}
    }
</pre>

In the above example, a "keyup" event on the Enter key (keycode 13), will result in a "click" event being dispatched to the "searchButton" element.

Modal Interfaces:
--

By default, an "onClick" interaction will removeremove all elements from the current Tab Order and replace them with a new set of Navigation rules, as in the case with a modal menu.  If we want to preserve the previous Tab Order and just append to it, we can simply specify '"preserveTabs":true' to the onClick event, as below:

## Example #3:

<pre>
    ...
    "onClick":{
        <b>"preserveTabs":true,</b>
        "objects":
            [  
                {  
                    "id":"#thirdControl",
                    "tab":3
                }
            ]
    }
    ...
</pre>

Applying Focus:
--

Occasionally, you might want a page interaction to focus a new element for the benefit of Screen-reading technologies.  To do this, we can add a "focus" property to the onClick object, as shown below.

Example #4:
--

<pre>
    ...
    "onClick":{
        "preserveTabs":false,
        <b>"focus":{  
            "id":"#thirdControl"
        },</b>
        "objects":
            [  
                {  
                    "id":"#thirdControl",
                    "tab":3
                }
            ]
    }
    ...
</pre>

Note the wrapper; the focus property accepts an object containing an id key/value pair, just like in the "objects" property, not just a CSS selector.

Going "Back":
--

Occasionally, as in the case of single-page applications with full-screen modal dialogs, you may have a 'close' button that brings a user back to to an earlier application state.  Instead of re-nesting all your tab-navigable controls again in an onClick property, you can use the 'back' property to tell Accessifizr to fetch an earlier tab navigation from up the Handlebars tree.

### Example #5:

<pre>
    {"tabOrder":{
        "objects":
            [  
                {  
                    "id":"#firstControl",
                    "tab":1,
                    "clickModes":"click,keyup[13|32]",
                    "onClick":{
                        "preserveTabs":false,
                        "focus":{  
                            "id":"#thirdControl"
                        },
                        "objects":
                            [  
                                {
                                    "id":"#thirdControl",
                                    "tab":3
                                    "clickModes":"click,keyup[13|32]",
                                    "onClick":{
                                        "preserveTabs":false,
                                        <b>"back":1,</b>
                                        "focus":{  
                                            "id":"#firstControl"
                                        }
                                    }
                                }
                            ]
                    }
                },
                {  
                    "id":"#secondControl",
                    "tab":2
                }
            ]
        }
    }
</pre>

In the example above, when the thirdControl is clicked, or a keyup event is recieved on that element from the Enter Key or the Spacebar, Accessifizr will float up "1" level to the surrounding "objects" array and re-apply the Tab Navigation rules to firstControl and secondControl.  If you have a deeply nested mode, and need to reapply rules from several 'steps' up, the value of "back" corresponds to the number of nests to migrate up.

Closing by Escaping:
--

Your keyboard-navigating users may find needing to explicitly tab to and activate a 'close' button needlessly complicated.  Typically, the 'Escape' key is used for this purpose to close current menus or dialogs.  To achieve this, Accessifizr can be configured to dispatch click events to close controls when a user clicks the Escape key on any of your tab-navigable elements, as shown with the 'onEsc' parameter below.  Note that it appears in onClick, rather than on the individual objects.

## Example #6:

<pre>
    ...
    "id":"#originalControl",
    "tab":1,
    "clickModes":"click,keyup[13|32]",
    "onClick":{
        "preserveTabs":false,
        "focus":{  
            "id":"#thirdControl"
        },
        <b>"escModes":"keyup[27]",
        "onEsc":{  
            "escControl":"#closeControl",
            "escControlEvt":"click"
        }</b>,
        "objects":
            [  
                {
                    "id":"#closeControl",
                    "tab":3
                    "clickModes":"click,keyup[13|32]",
                    "onClick":{
                        "back":1,
                        "focus":{  
                            "id":"#originalControl"
                        }
                    }
                },
                {
                    "id": "#anotherControl",
                    "tab":4
                }
            ]
    }
    ...
</pre>

This might look a little confusing at first, so let's step through what's going on.  First, we've wired up the "closeControl" element to be our actual close control.  Clicking or keying up with Enter or Space on this element will result in the previous tabOrder being re-applied to the application, and focus landing back on the "originalControl" element.

In the onClick property, we've specified "escMode" and "onEsc" properties, which will be applied to each of our onClick objects.  For all page elements specified in the "objects" property of the "onClick", a keyup event on the Escape key (keycode 27) will be interpreted as a 'click' event on the #closeControl element.  This will activate the #closeControl element in turn.

CSS Selectors:
--

Not all objects specified in the handlebars.json file need to be unique identifiers.  In cases where, for instance, an onClick event on a Search button should apply the same Handlebars rules to a list of result elements all sharing a .searchResult Class, you can specify a class selector instead.

## Example #7:

<pre>
    ...
    "onClick":{  
        "preserveTabs":true,
        "objects":
            [  
                {  
                <b>"id":".searchResult",</b>
                "tab":"3",
                "clickModes":"click,keyup[13]",
                "clickControl":"self",
                "clickControlEvt":"click",
                "onClick":{  
                    "preserveTabs":false,
                    "focus":{  
                        "id":"#resultTitle"
                    },
                    "objects":
                    [  
                        {  
                            "id":"#resultTitle",
                            "tab":2
                        },
                        {  
                            "id":"#resultDetails",
                            "tab":2
                        }
                    ]
                }
            }
        ]
    }
    ...
</pre>

Alt Text:
--

Some elements in a single-page website may require alternative text to be provided to clearly state the purpose of the element.  Good examples of this would be icon-based buttons whose purpose may be self-evident to a sighted user, but which might require additional description to be of use to a user requiring assistive technologies.

Accessifizr leverages the i18n dojo module to allow you to apply descriptive text via the 'alt' property to page elements in a similar way to how tabIndexes are applied.  Simply create an /nls/ subfolder in the directory containing accessifizr.js, and include a strings.js file containing 1) a root object containing key-value pairs for the unique-identifiers you've chosen for your page elements in handlebars.json, and the alternative text that you would like applied to the element, and 2) standard i18n nontation for any additional languages you'd like your application to support, to be coupled with the appropriate subfolder structure necessary for i18n functionality.  More information can be found on the dojo i18n documentation located at http://dojotoolkit.org/reference-guide/dojo/i18n.html.

## Example #8:

<pre>
    define({
      root: {
        "[settingid='widgets/Legend/Widget_14']": "Click To Activate Legend Tool",
        "[settingid='widgets/Chart/Widget_15']": "Click To Activate Chart Tool"
      },
      "ar": false,
      "cs": true,
      "da": true,
      "de": true,
      "es": true,
      "et": true,
      "fi": true,
      "fr": true,
      "he": false,
      "it": true,
      "ja": true,
      "ko": true,
      "lt": true,
      "lv": true,
      "nb": true,
      "nl": true,
      "pl": true,
      "pt-br": true,
      "pt-pt": true,
      "ro": true,
      "ru": true,
      "sv": true,
      "th": true,
      "tr": true,
      "zh-cn": true
    });
</pre>

Screen Reader Compatibility:
--

The methods by which Accessifizr applies Tab Navigation should be compatible with most modern Desktop screen reader technology.  Due to the lack of Aria support on most mobile browser technologies, Accessifizr cannot reliably control Tab Navigation on these devices.  We are currently attempting to develop a method of hiding by use of the applyAria flag in Accessifizr's init.

The use of Accessifizr is not a guarantee of your application's accessibility for the purposes of conforming to corporate or legal standards and requirements.  Always verify the accessibility of your application with an expert, even when using Accessifizr as a tool to make retrofitting your applications easier.

Experimental:
--

Aria:
--

Accessifizr can attempt to apply appropriate Aria tagging to Tab Navigable elements, and hide non-participating elements from screen readers.  To enable this capability, which should work for modern Desktop screenreaders but is not currently supported for all Mobile devices (Notably anything below Android 4.4 and iOS 6), add the following key value pair to your accessifizr.Init parameter:

<pre>
		<script type="text/javascript">
			require(["js/Accessifizr-0.9","dojo/text!js/handlebars.json", "dojo/domReady!"], function(Accessifizr, data) {
				Accessifizr.init({"data": data,<b>"applyAria": true</b>});
			});
		</script>
</pre>

Grids:
--

Currently, Accessifizr has beta support for Dojo dGrid elements.  To apply a TabIndex to a Dojo dGrid, specify an object in your Handlebars file as follows:

<pre>
    {  
        "id":"#grid",
        "tab":"4",
        "gridConfig":{  
            "type":"dgrid"
        }
    }
</pre>

Future support will allow for appropariate Aria styling and keyboard navigation within basic <code><table></code> elements.