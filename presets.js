presetBox = document.getElementById("presetBox");
presetCreator = document.getElementById("presetCreator");

// First, we test if there are already any presets saved.
const st = localStorage;
if (st.length) {
    // Show a list of presets for the user to pick from
    listPresets(presetBox);
}

function savePreset(name, d) {
    st.setItem(name, JSON.stringify(d));
    return(`Successfully saved preset ${name}.`);
}

function removePreset(name) {
    st.removeItem(name);
    return(`Successfully removed preset ${name}.`);
}

function listPresets(where) {
    for(i = 0; i < st.length; i++) {
        name = st.key(i);
        console.log(name, st.getItem(name));
        presetBox.insertAdjacentHTML("beforeend", `<option>${name}</option>`);
    }
}

function applyPreset(preset) {
    // Set preset values to textboxes
    // Automatically confirm settings
    let d = st.getItem(preset);
    console.log(d);

    if(d) {
        // Apply preset
        d = JSON.parse(d);
        console.log(d);
        devalueify(d);
        set();
    } else {
        // User wants to create new preset; show things visible.
        presetCreator.style.visibility = "visible";
        presetBox.style.position = "initial";
    }
}

function refreshPresets() {
    presetCreator.style.visibility = "hidden";
    presetBox.style.position = "absolute";
    presetBox.innerHTML = "<option>Create new ...</option>";
    listPresets(presetBox);
}