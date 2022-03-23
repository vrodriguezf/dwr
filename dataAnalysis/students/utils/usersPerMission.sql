DROP PROCEDURE IF EXISTS usersPerMission;

DELIMITER //
CREATE PROCEDURE usersPerMission(IN missionID INT)
BEGIN
   SELECT *
	FROM simulations 
	WHERE `importedTargetsDefinition.id` = missionID;
END //
DELIMITER ;