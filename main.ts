namespace SpriteKind {
    export const InstructionSprite = SpriteKind.create()
}
function checkForGameOver () {
    numActivePlayers = 0
    for (let value of playerIds) {
        if (getLives(value) > 0) {
            numActivePlayers += 1
        }
    }
    if (numActivePlayers == 0) {
        game.gameOver(false)
    } else if (numActivePlayers == 1) {
        game.gameOver(true)
    }
}
function printPlayerHands (msg: string) {
    console.log(msg)
    console.log("Player hands:")
    for (let index = 0; index <= playerIds.length - 1; index++) {
        playerId = playerIds[index]
        playerHand = playerHands[index]
        message = ""
        for (let cardIndex = 0; cardIndex <= playerHand.length - 1; cardIndex++) {
            tempCard = playerHand[cardIndex]
            message = "" + message + tempCard.name + ", "
        }
        console.logValue("Player " + playerId + " hand", message)
    }
    console.log("Player discards:")
    for (let index = 0; index <= playerIds.length - 1; index++) {
        playerId = playerIds[index]
        playerHand = playerDiscards[index]
        message = ""
        for (let cardIndex = 0; cardIndex <= playerHand.length - 1; cardIndex++) {
            tempCard = playerHand[cardIndex]
            message = "" + message + tempCard.name + ", "
        }
        console.logValue("Player " + playerId + " discard", message)
    }
}
function getLives (player2: number) {
    playerIndex = playerIds.indexOf(player2)
    playerHand = playerHands[playerIndex]
    playerDiscard = playerDiscards[playerIndex]
    return playerHand.length + playerDiscard.length
}
controller.player1.onButtonEvent(ControllerButton.A, ControllerButtonEvent.Pressed, function () {
    // Game modes
    // -1 ==> Activating players
    // 1 ==> Drawing cards
    // 2 ==> Cards moving
    if (gameMode == -1) {
        activatePlayer(1)
        info.player1.setScore(0)
        info.player1.setLife(1)
    } else if (gameMode == 1 && !(hasPlayerDrawn(1))) {
        drawCard(1)
    }
})
controller.player1.onButtonEvent(ControllerButton.B, ControllerButtonEvent.Pressed, function () {
    if (gameMode == -1 && playerIds.length > 1) {
        startGame()
    }
})
info.player4.onLifeZero(function () {
	
})
function startGame () {
    showInstructions()
    sprites.destroyAllSpritesOfKind(SpriteKind.InstructionSprite)
    if (playerIds.length == 3) {
        theDeck = PlayingCards.createDeckSimple(DeckType.Poker, 2)
    } else if (playerIds.length == 4) {
        theDeck = PlayingCards.createDeckSimple(DeckType.Poker, 4)
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
    for (let index2 = 0; index2 < playerIds.length; index2++) {
        playerHands.push([])
        playerDiscards.push([])
    }
    playerId = 0
    for (let index2 = 0; index2 < theDeck.numCards; index2++) {
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
function updateRoundSprite () {
    fancyText.setText(roundSprite, "Battle #" + round)
    roundSprite.setPosition(ROUND_SPRITE_X, ROUND_SPRITE_Y)
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
    console.logValue("scores", scores)
    console.logValue("score player IDs", scorePlayers)
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
    } else if (gameMode == 1 && !(hasPlayerDrawn(2))) {
        drawCard(2)
    }
})
function showWarInstructions () {
    game.showLongText("WAR!\\nPlayers draw " + NUM_WAR_CARDS + " cards. Only the last card counts! Winner takes all!", DialogLayout.Full)
}
controller.player3.onButtonEvent(ControllerButton.A, ControllerButtonEvent.Pressed, function () {
    if (gameMode == -1) {
        activatePlayer(3)
        info.player3.setScore(0)
        info.player3.setLife(1)
    } else if (gameMode == 1 && !(hasPlayerDrawn(3))) {
        drawCard(3)
    }
})
function resetPlayerSprites (player2: number) {
    playerIndex = playerIds.indexOf(player2)
    playerSprite = playerSprites[playerIndex]
    playerSprite.setFlag(SpriteFlag.Invisible, true)
    playerSprite.setPosition(xCards[player2], yCards[player2])
    playerSprite.follow(null)
    drawPrompt = drawPrompts[playerIndex]
    drawPrompt.setFlag(SpriteFlag.Invisible, true)
}
function drawCard (playerId: number) {
    if (cardsToDraw[playerId] > 0) {
        playerIndex = playerIds.indexOf(playerId)
        playerHand = playerHands[playerIndex]
        if (playerHand.length == 0) {
            resetPlayerHand(playerId)
            playerHand = playerHands[playerIndex]
        }
        playerCard = playerHand.shift()
        playerScore = playerCard.faceValue
        discardPile.push(playerCard)
        playerSprite = playerSprites[playerIndex]
        playerSprite.setImage(theDeck.getCardImage(playerCard, CardSpriteSize.Size32x32))
        playerSprite.setFlag(SpriteFlag.Invisible, false)
        setScore(playerId, playerScore)
        changeLives(playerId, -1)
        cardsToDraw[playerId] = cardsToDraw[playerId] - 1
        updateDrawPrompt(playerId)
        if (cardsToDraw[playerId] <= 0) {
            playersDrawn.push(playerId)
            if (playersDrawn.length == numPlayersInRound) {
                evaluateDraw()
            }
        }
    }
}
controller.player4.onButtonEvent(ControllerButton.A, ControllerButtonEvent.Pressed, function () {
    if (gameMode == -1) {
        activatePlayer(4)
        info.player4.setScore(0)
        info.player4.setLife(1)
    } else if (gameMode == 1 && !(hasPlayerDrawn(4))) {
        drawCard(4)
    }
})
function setupDraw (player2: number, numCards: number) {
    cardsToDraw[player2] = numCards
    updateDrawPrompt(player2)
}
info.player3.onLifeZero(function () {
	
})
function init () {
    NUM_WAR_CARDS = 4
    round = 0
    firstWar = true
    scene.setBackgroundColor(12)
    addGameHeader()
    printStrings(["Players:", "Press A to activate!"], 80, 60, 1)
    gameMode = -1
    playerIds = []
    playersDrawn = []
    playerSprites = []
    drawPrompts = []
    cardsToDraw = [
    0,
    0,
    0,
    0,
    0
    ]
    xCards = [
    0,
    18,
    142,
    18,
    142
    ]
    yCards = [
    0,
    32,
    32,
    88,
    88
    ]
    yDrawPrompts = [
    0,
    53,
    53,
    67,
    67
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
    roundSprite = fancyText.create("abc")
    roundSprite.setPosition(-20, -20)
    fancyText.setColor(roundSprite, 9)
    fancyText.setFont(roundSprite, fancyText.smallArcade)
    ROUND_SPRITE_X = 80
    ROUND_SPRITE_Y = 115
}
function setLives (player2: number, newLives: number) {
    if (player2 == 1) {
        info.player1.setLife(newLives)
    } else if (player2 == 2) {
        info.player2.setLife(newLives)
    } else if (player2 == 3) {
        info.player3.setLife(newLives)
    } else {
        info.player4.setLife(newLives)
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
function resetPlayerHand (player2: number) {
    printPlayerHands("Before shuffle")
    playerIndex = playerIds.indexOf(player2)
    playerHand = playerHands[playerIndex]
    // This should always be the case; verify anyway.
    if (playerHand.length == 0) {
        playerDiscard = playerDiscards[playerIndex]
        // Shuffle discards.
        for (let index = 0; index <= playerDiscard.length - 1; index++) {
            swapIndex = randint(0, playerDiscard.length - 1)
            if (index != swapIndex) {
                tempCard = playerDiscard[index]
                playerDiscard[index] = playerDiscard[swapIndex]
                playerDiscard[swapIndex] = tempCard
            }
        }
        playerHands[playerIndex] = playerDiscard
        playerDiscards[playerIndex] = []
        updateLives()
    }
    printPlayerHands("After shuffle")
}
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
function discardHand (hand: Card[]) {
    for (let value of hand) {
        discardPile.push(value)
    }
}
function endGameForPlayer (player2: number) {
    cardsToDraw[player2] = -1
    playerIndex = playerIds.indexOf(player2)
    playerHand = playerHands[playerIndex]
    discardHand(playerHand)
    playerHands[playerIndex] = []
    playerDiscard = playerDiscards[playerIndex]
    discardHand(playerDiscard)
    playerDiscards[playerIndex] = []
    setLives(player2, 0)
    music.play(music.melodyPlayable(music.wawawawaa), music.PlaybackMode.InBackground)
    playerSprite = playerSprites[playerIndex]
    playerSprite.setImage(assets.image`blankCard`)
    myTextSprite = fancyText.create("Game\\nOver")
    fancyText.setColor(myTextSprite, 15)
    fancyText.setFont(myTextSprite, fancyText.bold_sans_7)
    myTextSprite.setPosition(xCards[player2], yCards[player2])
    checkForGameOver()
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
        playerSprite.setFlag(SpriteFlag.Invisible, true)
        playerSprites.push(playerSprite)
        drawPrompt = fancyText.create("Draw 0")
        drawPrompt.setFlag(SpriteFlag.Ghost, true)
        drawPrompt.setFlag(SpriteFlag.Invisible, true)
        fancyText.setFont(drawPrompt, fancyText.smallArcade)
        fancyText.setColor(drawPrompt, 9)
        drawPrompts.push(drawPrompt)
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
function showInstructions () {
    message = "WAR!\\nAces are high."
    if (playerIds.length >= 3) {
        message = "" + message + "\\nJokers are higher!"
    }
    game.showLongText(message, DialogLayout.Center)
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
    gameMode = 2
    music.play(music.melodyPlayable(music.bigCrash), music.PlaybackMode.UntilDone)
    if (firstWar) {
        firstWar = false
        showWarInstructions()
    }
    sprites.destroyAllSpritesOfKind(SpriteKind.InstructionSprite)
    printStrings(["WAR!"], 80, 55, 1)
    for (let value of playerIds) {
        setScore(value, 0)
    }
    playersDrawn = []
    numPlayersInRound = 0
    index = 0
    while (index < scores.length && scores[index] == scores[0]) {
        playerId = scorePlayers[index]
        if (getLives(playerId) >= NUM_WAR_CARDS) {
            setupDraw(playerId, NUM_WAR_CARDS)
            numPlayersInRound += 1
            index += 1
        } else {
            endGameForPlayer(playerId)
        }
    }
    gameMode = 1
}
function updateDrawPrompt (player2: number) {
    playerIndex = playerIds.indexOf(player2)
    drawPrompt = drawPrompts[playerIndex]
    fancyText.setText(drawPrompt, "Draw" + cardsToDraw[player2])
    drawPrompt.setPosition(xCards[player2], yDrawPrompts[player2])
    drawPrompt.setFlag(SpriteFlag.Invisible, cardsToDraw[player2] == -1)
}
function startRound () {
    round += 1
    updateRoundSprite()
    updateLives()
    sprites.destroyAllSpritesOfKind(SpriteKind.InstructionSprite)
    printStrings(["Press A to draw!"], 80, 60, 1)
    playersDrawn = []
    numPlayersInRound = 0
    for (let index = 0; index <= playerIds.length - 1; index++) {
        playerId = playerIds[index]
        if (getLives(playerId) > 0) {
            setScore(playerId, 0)
            resetPlayerSprites(playerId)
            setupDraw(playerId, 1)
            numPlayersInRound += 1
        } else {
            if (cardsToDraw[playerId] > -1) {
                endGameForPlayer(playerId)
            }
        }
    }
    gameMode = 1
}
let index = 0
let instructionsSprite: fancyText.TextSprite = null
let y = 0
let playerLives = 0
let myTextSprite: fancyText.TextSprite = null
let swapIndex = 0
let headingSprite: fancyText.TextSprite = null
let temp = 0
let cornerSprite: Sprite = null
let yCorners: number[] = []
let xCorners: number[] = []
let yDrawPrompts: number[] = []
let firstWar = false
let numPlayersInRound = 0
let playersDrawn: number[] = []
let playerScore = 0
let playerCard: Card = null
let cardsToDraw: number[] = []
let drawPrompts: fancyText.TextSprite[] = []
let drawPrompt: fancyText.TextSprite = null
let yCards: number[] = []
let xCards: number[] = []
let playerSprites: Sprite[] = []
let playerSprite: Sprite = null
let NUM_WAR_CARDS = 0
let scorePlayers: number[] = []
let scores: number[] = []
let ROUND_SPRITE_Y = 0
let ROUND_SPRITE_X = 0
let round = 0
let roundSprite: fancyText.TextSprite = null
let discardPile: Card[] = []
let theDeck: Shoe = null
let gameMode = 0
let playerDiscard: Card[] = []
let playerIndex = 0
let playerDiscards: Card[][] = []
let tempCard: Card = null
let message = ""
let playerHands: Card[][] = []
let playerHand: Card[] = []
let playerId = 0
let playerIds: number[] = []
let numActivePlayers = 0
init()
