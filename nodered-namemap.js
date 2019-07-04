    // set up the table of names
    var nodeMap = global.get("nodeMap");
    //if (nodeMap === undefined)
        {
        // populate the map if needed.
        nodeMap = {};
        nodeMap['passivehouse-ecovillage.wnd-m1-mb-742890'] = {display_id:"Unit 1: Grid (742890)" };
        nodeMap['passivehouse-ecovillage.wnd-m1-mb-742901'] = {display_id:"Unit 3: Grid (742901)" };
        nodeMap['passivehouse-ecovillage.wnd-m1-mb-742905'] = {display_id:"Unit 2: Grid (742905)" };
        nodeMap['passivehouse-ecovillage.wnd-m1-mb-742906'] = {display_id:"Unit 1: Solar (742906)" };
        nodeMap['passivehouse-ecovillage.wnd-m1-mb-742909'] = {display_id:"Unit 2: Solar (742909)" };

        nodeMap['passivehouse-ecovillage.indoor-0002cc010000026b'] = {display_id:"Unit 1: Indoor downstairs (02-6b)" };
        nodeMap['passivehouse-ecovillage.indoor-0002cc0100000280'] = {display_id:"Unit 1: Indoor upstairs (02-80)" };
        nodeMap['passivehouse-ecovillage.indoor-0002cc0100000289'] = {display_id:"Unit 2: Indoor downstairs (02-89)" };
        nodeMap['passivehouse-ecovillage.indoor-0002cc010000028d'] = {display_id:"Unit 3: Indoor upstairs (02-8d)" };
        nodeMap['passivehouse-ecovillage.indoor-0002cc010000028e'] = {display_id:"Unit 3: Indoor downstairs (02-8e)" };
        nodeMap['passivehouse-ecovillage.indoor-0002cc0100000290'] = {display_id:"Unit 2: Indoor upstairs (02-90)" };
        
        nodeMap['passivehouse-ecovillage.outdoor-0002cc0100000269'] = {display_id:"Unit 1: Outdoors" };
        nodeMap['passivehouse-ecovillage.outdoor-0002cc010000028c'] = {display_id:"Unit 2: Outdoors" };
        nodeMap['passivehouse-ecovillage.outdoor-0002cc010000028f'] = {display_id:"Unit 3: Outdoors" };

        global.set("nodeMap", nodeMap);
        }

    // use app_id.dev_id to form a key
    // and put into the message
    var sKey = msg.app_id + "." + msg.dev_id;

    msg.display_key = sKey;

    // translate the key if needed.
    if (sKey in nodeMap)
        {
        msg.display_id = nodeMap[sKey].display_id;
        if ("lat" in nodeMap[sKey])
            msg.display_lat = nodeMap[sKey].lat;
        if ("long" in nodeMap[sKey])
            msg.display_long = nodeMap[sKey].long;
        }
    else
        {
        msg.display_id = sKey;
        }

    return msg;
