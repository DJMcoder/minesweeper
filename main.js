var rows = 20       // number of rows     in the field
var cols = 50      // number of coloumns in the field
var num_bombs = 100   // number of bombs    in the field
var field = []      // the field
var bombs = []      // the positions of the bombs

var game_over = false

var started = false
var start_time
var win_time
var update_time

function update_time_func() {
  $('#time').text((getTime()/1000).toFixed(2), 10)
}

function initiateStartTime() {
  if (started) return
  started = true
  start_time = Date.now()
  update_time = setInterval(update_time_func)
}

function getTime() {
  if (!started) return 0
  return Date.now() - start_time
}

function range(num) {
  return Array.apply(0, Array(num)).map(function(e,i) { return i })
}

var rand_arr = range(rows*cols)
var rand_max = rows*cols-1
function uniqueRandom() {
  var rand = Math.floor(Math.random()*rand_max)
  var res = rand_arr[rand]
  rand_arr[rand] = rand_arr[rand_max]
  rand_arr[rand_max] = res
  rand_max--
  return res
}

for (var i = 0; i < num_bombs; i++) {
  bombs.push(uniqueRandom())
}

for (var i = 0; i < rows; i++) {
  var cur_row = []
  var cur_row_html = $('tbody#grid').append('<tr row="' + i + '"></tr>').find('tr[row="' + i + '"]')
  for (var j = 0; j < cols; j++) {
    var isBomb = bombs.includes(i*cols+j)
    $(cur_row_html).append('<td col="' + j + '" bomb="' + isBomb + '"></td>')
    cur_row.push(isBomb)
  }
  field.push(cur_row)
}

var deltas = [
  [-1,-1], [-1,0], [-1,1],
  [0, -1],         [0, 1],
  [1, -1], [1, 0], [1, 1]
]
function surroundingLocations(x,y) {
  return deltas.map(function(i) { return [i[0] + x, i[1] + y] })
}
function numBombsAround(x,y) {
  var surroundings = surroundingLocations(x,y)
  var sum = 0;
  for (var i = surroundings.length-1; i >= 0; i--) {
    if (surroundings[i][0] < 0 || surroundings[i][0] >= rows || surroundings[i][1] < 0 || surroundings[i][1] >= cols)
      surroundings.splice(i,1)
    else sum += field[surroundings[i][0]][surroundings[i][1]]
  }
  return sum
}

function checkIfWon() {
  if ($('td.revealed').length < rows*cols-num_bombs) return false
  if (game_over) {
    alert('You won the game ... but you lost earlier')
    $('#time')text('[GAME LOST] "Winning" time: <span id="time">' + won_time/1000 +'</span> seconds')
    return false
  }
  won_time = getTime()
  clearInterval(update_time)
  alert('You won! Time = ' + won_time/1000 + ' seconds')
  $('#time').parent().html('Winning time: <span id="time">' + won_time/1000 +'</span> seconds')
  return true
}

$('td[bomb="false"]').click(function() {
  initiateStartTime()
  if ($(this).hasClass('flagged') || $(this).hasClass('revealed')) return
  var x = parseInt($(this).parent().attr('row'), 10)
  var y = parseInt($(this).attr('col'), 10)
  var bombs_around = numBombsAround(x,y)
  $(this).addClass('revealed')
  checkIfWon()
  if (bombs_around) $(this).text(bombs_around)
  else {
    for (var loc of surroundingLocations(x,y)) {
      $('tr[row="' + loc[0] + '"] > td[col="' + loc[1] + '"]:not(.revealed)').trigger('click')
    }
  }

})

$('td:not(.revealed)').contextmenu(function(e) {
  e.preventDefault()
  $(this).toggleClass('flagged')
})

$('td[bomb="true"]').click(function() {

  if ($(this).hasClass('flagged')) return
  if (game_lost) return
  $('#time').parent().html('[GAME LOST] Time: <span id="time"></span> seconds')
  update_time_func()
  alert('Game over! You can keep playing, but you will not actually win the game.')
})
