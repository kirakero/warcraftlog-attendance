let axios = require("axios")

let key = process.argv[2]
let api = `https://classic.warcraftlogs.com/reports/fights-and-participants/${key}/0`
let friendlies = ['Hunter','Warrior','Paladin','Mage','Warlock','Druid','Priest','Rogue'].sort((a,b)=> a > b ? 1 : (b > a ? -1 : 0))
let cuts = [0, .2, .8]
let dkp =  [0,  5, 10]

let boss_local_max = 0
let boss_count = function (bosses) {
    bosses = bosses.split('.').filter(_=>parseInt(_)>0)//.filter(onlyUnique) << this is for counting only kills
    return bosses.length
}

let bosses_to_dkp = function (bosses) {
    let percent = bosses / boss_local_max
    let i = cuts.length - 1
    while (percent < cuts[i]) {
        i--
    }
    return dkp[i]
}

let onlyUnique = function (value, index, self) {
    return self.indexOf(value) === index;
}

axios.get(api).then(result => {
    let players = result.data.friendlies.filter(_=>friendlies.indexOf(_.type) !== -1)

    players.map(_=> {
        _.bosses = boss_count(_.bosses)
        if (_.bosses > boss_local_max)
            boss_local_max = _.bosses
    })
    console.log(`Summary for ${key} -- created`, new Date(Date.now()).toLocaleString().split(',')[0])

    console.log('Name'.padEnd(15,' '),'Class'.padEnd(10,' '),'Attempts'.padStart(9),'DKP'.padStart(5,' '))
    players
        .sort((a,b) => {
            if(a.type === b.type) {
                return (a.name < b.name) ? -1 : (a.name > b.name) ? 1 : 0;
            } else {
                return (a.type < b.type) ? -1 : 1;
            }
        })
        .map(_=>console.log(_.name.padEnd(15,' '),_.type.padEnd(10,' '),_.bosses.toString().padStart(4)+'/'+boss_local_max.toString().padEnd(4),bosses_to_dkp(_.bosses).toString().padStart(5,' ')))
})