// Simple in-memory room management

const rooms = new Map();

function createRoom() {
  const token = Math.random().toString(36).substring(2, 8);
  rooms.set(token, {
    clients: new Set(),
    broadcast(sender, data) {
      for (const client of this.clients) {
        if (client !== sender && client.readyState === 1) {
          client.send(JSON.stringify(data));
        }
      }
    },
    remove(client) {
      this.clients.delete(client);
      if (this.clients.size === 0) {
        rooms.delete(token);
      }
    },
  });
  console.log(`🎬 Room created: ${token}`);
  return token;
}

function joinRoom(token, ws, role = 'client') {
  const room = rooms.get(token);
  if (!room) {
    console.log(`❌ Tried to join invalid room: ${token}`);
    return null;
  }
  room.clients.add(ws);
  console.log(`✅ ${role} joined room ${token} (${room.clients.size} total)`);
  return room;
}

module.exports = { createRoom, joinRoom, rooms };
