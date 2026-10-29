const has = n => Vars.tree.get("music/" + n + ".ogg").exists();
const cache = {};
const load = n => {
    if(!cache[n]) cache[n] = Core.audio.newMusic(Vars.tree.get("music/" + n + ".ogg"));
    return cache[n];
};
const pick = arr => arr[Math.floor(Math.random() * arr.length)];

const single = {
    menu:   ["menu", "menu1", "menu2"],
    launch: ["launch", "launch1"],
    land:   ["land", "land1"],
    editor: ["editor", "editor1"]
};

const ambient = ["game10", "game11", "game12"];
const dark    = [];
const boss    = [];

const last = {};
const launchPlanets = [];

function roll(key){
    var options = single[key].filter(has);
    if(options.length > 1 && last[key]){
        options = options.filter(n => n != last[key]);
    }
    if(options.length > 0){
        const name = pick(options);
        last[key] = name;
        const m = load(name);
        Musics[key] = m;
        if(key == "launch"){
            launchPlanets.forEach(p => { p.launchMusic = m; });
        }
        Log.info("[music] " + key + " -> " + name);
    }
}

function currentScene(){
    if(Vars.state.isGame()) return "game";
    if(Vars.ui.planet != null && Vars.ui.planet.isShown()) return "launch";
    if(Vars.ui.editor != null && Vars.ui.editor.isShown()) return "editor";
    return "menu";
}

var scene = null;

Events.on(ClientLoadEvent, () => {
    try{
        const orig = Musics.launch;
        Vars.content.planets().each(p => {
            if(p.launchMusic == orig) launchPlanets.push(p);
        });
        if(launchPlanets.length == 0) launchPlanets.push(Planets.serpulo);
        Log.info("[music] launch planets: " + launchPlanets.length);

        for(var key in single) roll(key);
        ambient.filter(has).forEach(n => Vars.control.sound.ambientMusic.add(load(n)));
        dark.filter(has).forEach(n => Vars.control.sound.darkMusic.add(load(n)));
        boss.filter(has).forEach(n => Vars.control.sound.bossMusic.add(load(n)));
        scene = currentScene();
    }catch(e){
        Log.info("[music] load fail: " + e);
    }
});

Events.run(Trigger.update, () => {
    if(scene == null || Vars.ui == null) return;
    const now = currentScene();
    if(now != scene){
        scene = now;
        for(var key in single){
            if(key != now) roll(key);
        }
    }
});
