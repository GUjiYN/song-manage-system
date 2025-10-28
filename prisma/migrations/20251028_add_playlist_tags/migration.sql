-- Create join table for playlist tags
CREATE TABLE `PlaylistTag` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `playlistId` INT NOT NULL,
  `tagId` INT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `PlaylistTag_playlistId_tagId_key` (`playlistId`, `tagId`),
  INDEX `PlaylistTag_playlistId_idx` (`playlistId`),
  INDEX `PlaylistTag_tagId_idx` (`tagId`),
  CONSTRAINT `PlaylistTag_playlistId_fkey`
    FOREIGN KEY (`playlistId`) REFERENCES `Playlist`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `PlaylistTag_tagId_fkey`
    FOREIGN KEY (`tagId`) REFERENCES `Tag`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
