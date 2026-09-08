import { ArrowRight, Check, Crown, Shield } from 'lucide-react';
import type { PublicRoom } from './game';

export function StoryOverview({ room, userId, canSelect, onSelect }: {
  room: PublicRoom;
  userId: string;
  canSelect: boolean;
  onSelect: (id: string) => void;
}) {
  return <div className="story-overview">{room.stories.map((story, index) => (
    <article className={'overview-story ' + (story.id === room.activeId ? 'is-active' : '')} key={story.id} aria-labelledby={'overview-' + story.id}>
      <div className="overview-story-content">
        <div className="overview-kicker">
          <span>{story.reference || `STORY ${String(index + 1).padStart(2, '0')}`}</span>
          {story.id === room.activeId && <span className="status-pill">Actieve story</span>}
        </div>
        <h3 id={'overview-' + story.id}>{story.title}</h3>
        {story.description && <p className="overview-description">{story.description}</p>}
        <div className="overview-story-footer">
          {story.estimate !== null ? <span className="overview-final"><Check size={15}/><strong>{story.estimate}</strong> definitief</span> : <span className="overview-pending">{story.revealed ? 'Bespreek de inschatting' : 'Nog niet ingeschat'}</span>}
          {canSelect && <button className="text-button" onClick={() => onSelect(story.id)}>{story.estimate !== null ? 'Bekijk in de arena' : 'Schat deze story in'}<ArrowRight size={15}/></button>}
        </div>
      </div>
      <ul className="overview-votes" aria-label="Inschattingen per collega">
        {room.members.map((member, memberIndex) => {
          const voted = Object.hasOwn(story.votes, member.id);
          const visible = story.revealed && voted && story.votes[member.id] !== null;
          const voteLabel = visible ? `${story.votes[member.id]} punten` : voted ? 'Stem verborgen' : 'Nog niet gestemd';
          return <li key={member.id}>
            <span className={'avatar avatar-' + memberIndex % 4}>{member.name.slice(0, 1).toUpperCase()}</span>
            <span className="overview-member-name">{member.name}{member.id === userId && <small> (jij)</small>}{!member.online && <small className="overview-offline">Offline</small>}</span>
            {member.host && <Crown className="overview-crown" size={14} aria-label="Sessieleider"/>}
            <span className={'overview-vote-card ' + (visible ? 'revealed' : voted ? 'hidden-vote' : 'no-vote')} aria-label={`${member.name}: ${voteLabel}`}>
              {visible ? story.votes[member.id] : voted ? <Shield size={19}/> : <span aria-hidden="true">—</span>}
            </span>
          </li>;
        })}
      </ul>
    </article>
  ))}</div>;
}
