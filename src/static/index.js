// import { createRequire } from 'module';
// const require = createRequire(import.meta.url);

function jq(htmlid) {
    return htmlid.replace(/(:|\.|\[|\]|,|=|@)/g, "\\$1").replace(/\//g, "-");
}
function readJsonData() { 
    const urlParams = new URLSearchParams(window.location.search);
    const spotUrl = urlParams.get('spotUrl')
    fetch(spotUrl).then(async (response) => {
        const data = await response.json()
        if (data && Array.isArray(data)) {
            data.forEach(item => {
                if (item) {
                    let views = item.Views;
                    createRegions(views)
                    renderViews(views);
                }
            });
        } else if (data && data.Views && !Array.isArray(data)) {
            processResponses(data);
            renderViews(data.Views);
        }
    })
}

function createRegions (views) {
    const regions = views.map(view => view.Region)
    regions.forEach(region => {
        const div = document.createElement('div')
        div.setAttribute('id', region)
        document.body.appendChild(div)
    }) 
}

 function processResponses(jsonResponse) {
        // If the jsonResponse has not been parsed, parse it now.
        if (typeof (jsonResponse) === "string") {
            jsonResponse = $.parseJSON(jsonResponse);
        }
        var resourceNeeds = getAllResources(jsonResponse);

        // Queue resource links.
        ResourceManager.addResources(
            resourceNeeds.CombinatorUri,
            resourceNeeds.links,
            function (success) {
                // Process each response
                outputResourceBlocks(resourceNeeds.blocks);
            });
    }
	
	  // Returns all of the link resources and block in the given responses
    function getAllResources(responses) {
        // Separate the Link resources from the Block resources.
        var result = {
            links: [],
            blocks: [],
            CombinatorUri: 'combo'
        };

        $(responses).each(function () {
            result.CombinatorUri = this.CombinatorUri;
            if (this.ResponseType.Value == 'Views' && this.Resources) {
                $(this.Resources).each(function () {
                    // Push on to link or block resource collection based on if there is a src.
                    if (this.Src !== null && this.Src.length > 0) {
                        result.links.push(this.Src);
                    } // Must be a block resource (script block).
                    else {
                        result.blocks.push(this);
                    }
                });
            }
        });

        return result;
    }
	
	function renderViews(views) {
        if (views && views.length > 0) {
			console.log(views.length)

            for (var i = 0; i < views.length; i++) {
                var view = views[i];
                if (view && view.Content && view.Region) {
					console.log(view.Content);
					
                    renderView(view.Content, view.InsertionMode, view.Region);
                    $('#' + jq(view.Region)).removeAttr("style");
                    /*if (divIdFromDialog !== view.Region) {
                        $('#' + jq(view.Region)).appendTo('#' + jq(divIdFromDialog));
                    }*/
                }
            }
        }
    }


    // Renders the given view
    function renderView(content, insertionMode, region) {
        // Places the content into the given region.        
        //var isRenderSuccessful = false;           
        var $region = $('#' + jq(region));
        //var $divIdFromDialog = $('#' + jq(divIdFromDialog));

        // If region does not exist, insert it into the body as hidden for script to pull.            
        /*if (divIdFromDialog === region) {
            if ($region.length === 0) {
                $region = $('<div/>', {
                    id: jq(region)
                }).hide().appendTo(document.body);
            }
        } else {
            if ($region.length === 0) {
                $region = $('<div/>', {
                    id: jq(region)
                }).hide().appendTo($divIdFromDialog);
            }
        }*/

        switch (insertionMode.Value) {
            case 'InsertBefore':
                $region.prepend(content);
                break;

            case 'InsertAfter':
                $region.append(content);
                break;

            case 'Replace':
                $region.empty().append(content);
                break;

            default:
                $region.empty().append(content);
                break;

        }
    }
