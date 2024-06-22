namespace SpriteKind {
    export const InstructionSprite = SpriteKind.create()
}
function evaluateWar () {
	
}
controller.player1.onButtonEvent(ControllerButton.B, ControllerButtonEvent.Pressed, function () {
    if (gameMode == -1 && playerIds.length > 1) {
        message = "Aces are high."
        if (playerIds.length == 3) {
            message = "Aces are high.\\nJokers are higher!"
        }
        game.showLongText(message, DialogLayout.Center)
        startGame()
    }
})
info.player4.onLifeZero(function () {
	
})
function startGame () {
    sprites.destroyAllSpritesOfKind(SpriteKind.InstructionSprite)
    if (playerIds.length == 3) {
        theDeck = PlayingCards.createDeckSimple(DeckType.Poker, 2)
    } else {
        theDeck = PlayingCards.createPokerDeck()
    }
    theDeck.isAceHigh = true
    playerHands = [[theDeck.nextCard]]
    playerHands.pop()
    playerDiscards = [[theDeck.nextCard]]
    playerDiscards.pop()
    discardPile = [theDeck.nextCard]
    discardPile.pop()
    theDeck.shuffle()
    for (let index = 0; index < playerIds.length; index++) {
        playerHands.push([])
        playerDiscards.push([])
    }
    playerId = 0
    for (let index = 0; index < theDeck.numCards; index++) {
        playerHand = playerHands[playerId]
        playerHand.push(theDeck.nextCard)
        playerId += 1
        if (playerId >= playerIds.length) {
            playerId = 0
        }
    }
    updateLives()
    startRound()
}
function getArrayIndexForPlayerId (player2: number) {
    return playerIds.indexOf(player2)
}
function evaluateDraw () {
    sprites.destroyAllSpritesOfKind(SpriteKind.InstructionSprite)
    scores = []
    scorePlayers = []
    for (let value of playerIds) {
        scorePlayers.push(value)
        if (value == 1) {
            scores.push(info.player1.score())
        } else if (value == 2) {
            scores.push(info.player2.score())
        } else if (value == 3) {
            scores.push(info.player3.score())
        } else {
            scores.push(info.player4.score())
        }
    }
    sortScores()
    if (scores[0] == scores[1]) {
        startWar()
    } else {
        awardDraw()
    }
}
controller.player2.onButtonEvent(ControllerButton.A, ControllerButtonEvent.Pressed, function () {
    if (gameMode == -1) {
        activatePlayer(2)
        info.player2.setScore(0)
        info.player2.setLife(1)
    } else if (gameMode == 1 && (!(hasPlayerDrawn(2)) && info.player2.life() > 0)) {
        drawCard(2)
    }
})
controller.player3.onButtonEvent(ControllerButton.A, ControllerButtonEvent.Pressed, function () {
    if (gameMode == -1) {
        activatePlayer(3)
        info.player3.setScore(0)
        info.player3.setLife(1)
    } else if (gameMode == 1 && (!(hasPlayerDrawn(3)) && info.player3.life() > 0)) {
        drawCard(3)
    }
})
function resetPlayerSprites (player2: number) {
    playerIndex = playerIds.indexOf(player2)
    playerSprite = playerSprites[playerIndex]
    playerSprite.setFlag(SpriteFlag.Invisible, true)
    playerSprite.setPosition(xCoords[player2], yCoords[player2])
    playerSprite.follow(null)
}
function drawCard (playerId: number) {
    playersDrawn.push(playerId)
    playerIndex = playerIds.indexOf(playerId)
    playerHand = playerHands[playerIndex]
    playerCard = playerHand.shift()
    playerScore = playerCard.faceValue
    discardPile.push(playerCard)
    playerSprite = playerSprites[playerIndex]
    playerSprite.setImage(theDeck.getCardImage(playerCard, CardSpriteSize.Size32x32))
    playerSprite.setFlag(SpriteFlag.Invisible, false)
    setScore(playerId, playerScore)
    changeLives(playerId, -1)
    if (playersDrawn.length == playerIds.length) {
        evaluateDraw()
    }
}
controller.player4.onButtonEvent(ControllerButton.A, ControllerButtonEvent.Pressed, function () {
    if (gameMode == -1) {
        activatePlayer(4)
        info.player4.setScore(0)
        info.player4.setLife(1)
    } else if (gameMode == 1 && (!(hasPlayerDrawn(4)) && info.player4.life() > 0)) {
        drawCard(4)
    }
})
info.player3.onLifeZero(function () {
	
})
function init () {
    scene.setBackgroundColor(12)
    addGameHeader()
    printStrings(["Players:", "Press A to activate!"], 80, 60, 1)
    gameMode = -1
    playerIds = []
    playersDrawn = []
    playerSprites = []
    xCoords = [
    0,
    16,
    144,
    16,
    144
    ]
    yCoords = [
    0,
    32,
    32,
    88,
    88
    ]
    xCorners = [
    0,
    -20,
    180,
    -20,
    180
    ]
    yCorners = [
    0,
    -20,
    -20,
    140,
    140
    ]
    cornerSprite = sprites.create(assets.image`cornerSprite`, SpriteKind.Enemy)
    cornerSprite.setPosition(-20, -20)
}
function setLives (player2: number, newLives: number) {
    if (player2 == 1) {
        info.player1.setLife(newLives)
    } else if (player2 == 2) {
        info.player2.setLife(newLives)
    } else if (player2 == 3) {
        info.player3.setLife(newLives)
    } else {
        info.player4.setLife(playerLives)
    }
}
function swapElements (list: number[], firstIndex: number, secondIndex: number) {
    temp = list[firstIndex]
    list[firstIndex] = list[secondIndex]
    list[secondIndex] = temp
}
function sortScores () {
    for (let round = 0; round <= scores.length - 1; round++) {
        for (let index = 0; index <= scores.length - 2 - round; index++) {
            if (scores[index] < scores[index + 1]) {
                swapElements(scores, index, index + 1)
                swapElements(scorePlayers, index, index + 1)
            }
        }
    }
}
function changeScore (player2: number, change: number) {
    if (player2 == 1) {
        info.player1.changeScoreBy(change)
    } else if (player2 == 2) {
        info.player2.changeScoreBy(change)
    } else if (player2 == 3) {
        info.player3.changeScoreBy(change)
    } else {
        info.player4.changeScoreBy(change)
    }
}
function addGameHeader () {
    headingSprite = fancyText.create("War!")
    fancyText.setFont(headingSprite, fancyText.gothic_large)
    headingSprite.setPosition(80, 15)
}
function setScore (player2: number, newScore: number) {
    if (player2 == 1) {
        info.player1.setScore(newScore)
    } else if (player2 == 2) {
        info.player2.setScore(newScore)
    } else if (player2 == 3) {
        info.player3.setScore(newScore)
    } else {
        info.player4.setScore(newScore)
    }
}
controller.player1.onButtonEvent(ControllerButton.A, ControllerButtonEvent.Pressed, function () {
    // Game modes
    // -1 ==> Activating players
    // 1 ==> Drawing cards
    // 2 ==> Cards moving
    // 10 ==> Drawing war!
    if (gameMode == -1) {
        activatePlayer(1)
        info.player1.setScore(0)
        info.player1.setLife(1)
    } else if (gameMode == 1 && (!(hasPlayerDrawn(1)) && info.player1.life() > 0)) {
        drawCard(1)
    }
})
info.player1.onLifeZero(function () {
	
})
function changeLives (player2: number, change: number) {
    if (player2 == 1) {
        info.player1.changeLifeBy(change)
    } else if (player2 == 2) {
        info.player2.changeLifeBy(change)
    } else if (player2 == 3) {
        info.player3.changeLifeBy(change)
    } else {
        info.player4.changeLifeBy(change)
    }
}
info.player2.onLifeZero(function () {
	
})
function updateLives () {
    for (let index = 0; index <= playerIds.length - 1; index++) {
        playerId = playerIds[index]
        playerHand = playerHands[index]
        playerDiscard = playerDiscards[index]
        playerLives = playerHand.length + playerDiscard.length
        setLives(playerId, playerLives)
    }
}
function activatePlayer (player2: number) {
    if (playerIds.indexOf(player2) == -1) {
        playerIds.push(player2)
        playerSprite = sprites.create(assets.image`blankCard`, SpriteKind.Player)
        playerSprite.setFlag(SpriteFlag.Ghost, true)
        playerSprites.push(playerSprite)
    }
    if (playerIds.length == 2) {
        printStrings(["Player 1:", "Press B to start game!"], 80, 90, 5)
    }
}
function hasPlayerDrawn (playerId: number) {
    return playersDrawn.indexOf(playerId) > -1
}
function awardDraw () {
    gameMode = 2
    pause(1000)
    playerId = scorePlayers[0]
    cornerSprite.setPosition(xCorners[playerId], yCorners[playerId])
    for (let value of playerSprites) {
        value.follow(cornerSprite)
    }
    pause(1000)
    playerIndex = playerIds.indexOf(playerId)
    playerHand = playerDiscards[playerIndex]
    for (let value of discardPile) {
        playerHand.push(value)
        changeLives(playerId, 1)
        music.play(music.melodyPlayable(music.baDing), music.PlaybackMode.UntilDone)
    }
    discardPile = []
    startRound()
}
function printStrings (stringList: string[], x: number, startingY: number, color: number) {
    y = startingY
    for (let value of stringList) {
        instructionsSprite = fancyText.create(value)
        instructionsSprite.setPosition(x, y)
        fancyText.setColor(instructionsSprite, color)
        instructionsSprite.setKind(SpriteKind.InstructionSprite)
        y += 10
    }
}
function startWar () {
	
}
function startRound () {
    updateLives()
    sprites.destroyAllSpritesOfKind(SpriteKind.InstructionSprite)
    printStrings(["Press A to draw!"], 80, 60, 1)
    gameMode = 1
    playersDrawn = []
    for (let index = 0; index <= playerIds.length - 1; index++) {
        playerId = playerIds[index]
        if (playerId == 1) {
            info.player1.setScore(0)
        } else if (playerId == 2) {
            info.player2.setScore(0)
        } else if (playerId == 3) {
            info.player3.setScore(0)
        } else {
            info.player4.setScore(0)
        }
        resetPlayerSprites(playerId)
    }
}
let instructionsSprite: fancyText.TextSprite = null
let y = 0
let playerDiscard: Card[] = []
let headingSprite: fancyText.TextSprite = null
let temp = 0
let playerLives = 0
let cornerSprite: Sprite = null
let yCorners: number[] = []
let xCorners: number[] = []
let playerScore = 0
let playerCard: Card = null
let playersDrawn: number[] = []
let yCoords: number[] = []
let xCoords: number[] = []
let playerSprites: Sprite[] = []
let playerSprite: Sprite = null
let playerIndex = 0
let scorePlayers: number[] = []
let scores: number[] = []
let playerHand: Card[] = []
let playerId = 0
let discardPile: Card[] = []
let playerDiscards: Card[][] = []
let playerHands: Card[][] = []
let theDeck: Shoe = null
let message = ""
let playerIds: number[] = []
let gameMode = 0
init()
